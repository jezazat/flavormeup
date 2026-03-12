const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// สมัครสมาชิก (Register)
router.post('/register', async (req, res) => {
  let connection;
  try {
    const { username, email, password, confirmPassword } = req.body;

    // ตรวจสอบข้อมูล
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบ' });
    }

    // ตรวจสอบความยาวรหัสผ่าน
    if (password.length < 6) {
      return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร' });
    }

    // ตรวจสอบรหัสผ่านตรงกัน
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'รหัสผ่านไม่ตรงกัน' });
    }

    connection = await pool.getConnection();

    // ตรวจสอบว่า username หรือ email ซ้ำไหม
    const [existingUsers] = await connection.execute(
      'SELECT * FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Username หรือ Email นี้มีผู้ใช้แล้ว' });
    }

    // Hash รหัสผ่าน
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // บันทึกผู้ใช้ลง database
    const [result] = await connection.execute(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, 'user']
    );

    res.status(201).json({
      message: 'ลงทะเบียนสำเร็จ',
      userId: result.insertId,
      username
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการลงทะเบียน' });
  } finally {
    if (connection) connection.release();
  }
});

// เข้าสู่ระบบ (Login)
router.post('/login', async (req, res) => {
  let connection;
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'กรุณากรอก username และ password' });
    }

    connection = await pool.getConnection();

    const [users] = await connection.execute(
      'SELECT id, username, email, password, role FROM users WHERE username = ? LIMIT 1',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'ไม่พบผู้ใช้' });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'รหัสผ่านไม่ถูกต้อง' });
    }

    // สร้าง JWT Token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key-change-this',
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    res.json({
      message: 'เข้าสู่ระบบสำเร็จ',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' });
  } finally {
    if (connection) connection.release();
  }
});

// ตรวจสอบ Token และรับข้อมูลผู้ใช้ปัจจุบัน
router.get('/me', verifyToken, async (req, res) => {
  try {
    res.json({
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  }
});

module.exports = router;
