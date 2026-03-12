const express = require('express');
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// ดึงรายชื่อผู้ใช้ทั้งหมด
router.get('/users', verifyAdmin, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [users] = await connection.execute(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

// ดึงสถิติต่างๆ
router.get('/stats', verifyAdmin, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // จำนวนผู้ใช้ทั้งหมด
    const [usersResult] = await connection.execute('SELECT COUNT(*) as total FROM users');
    
    // จำนวนคำสั่งซื้อทั้งหมด
    const [ordersResult] = await connection.execute('SELECT COUNT(*) as total FROM orders');
    
    // ยอดขายทั้งหมด
    const [salesResult] = await connection.execute('SELECT SUM(total_price) as total FROM orders WHERE status = "completed"');
    
    // จำนวนสินค้า
    const [productsResult] = await connection.execute('SELECT COUNT(*) as total FROM products');

    res.json({
      totalUsers: usersResult[0].total,
      totalOrders: ordersResult[0].total,
      totalSales: salesResult[0].total || 0,
      totalProducts: productsResult[0].total
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

// ลบผู้ใช้
router.delete('/users/:id', verifyAdmin, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.execute('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'ลบผู้ใช้สำเร็จ' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

// รีเซ็ตรหัสผ่านผู้ใช้
router.put('/users/:id/reset-password', verifyAdmin, async (req, res) => {
  let connection;
  try {
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    connection = await pool.getConnection();
    await connection.execute(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.params.id]
    );

    res.json({ 
      message: 'รีเซ็ตรหัสผ่านสำเร็จ',
      newPassword: '123456'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

// อัปเดต role ผู้ใช้
router.put('/users/:id/role', verifyAdmin, async (req, res) => {
  let connection;
  try {
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Role ไม่ถูกต้อง' });
    }

    connection = await pool.getConnection();
    await connection.execute(
      'UPDATE users SET role = ? WHERE id = ?',
      [role, req.params.id]
    );

    res.json({ message: 'อัปเดต role สำเร็จ' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
