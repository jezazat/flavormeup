const express = require('express');
const { pool } = require('../config/database');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// ดึงรายการในตะกร้า
router.get('/', verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [cartItems] = await connection.execute(
      `SELECT c.id, c.product_id, c.quantity, p.name, p.price, p.image_url, p.category 
       FROM cart c 
       JOIN products p ON c.product_id = p.id 
       WHERE c.user_id = ? 
       ORDER BY c.created_at DESC`,
      [req.user.id]
    );

    res.json(cartItems);

  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

// เพิ่มสินค้าลงตะกร้า
router.post('/add', verifyToken, async (req, res) => {
  let connection;
  try {
    const { product_id, quantity } = req.body;

    if (!product_id || !quantity) {
      return res.status(400).json({ error: 'กรุณาระบุสินค้าและจำนวน' });
    }

    connection = await pool.getConnection();

    // ตรวจสอบสินค้ามีอยู่และมีสต็อก
    const [products] = await connection.execute(
      'SELECT id, stock FROM products WHERE id = ?',
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }

    if (products[0].stock < quantity) {
      return res.status(400).json({ error: 'สต็อกไม่เพียงพอ' });
    }

    // ตรวจสอบว่ามีในตะกร้าแล้วหรือไม่
    const [existingItems] = await connection.execute(
      'SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?',
      [req.user.id, product_id]
    );

    if (existingItems.length > 0) {
      // อัปเดตจำนวน
      const newQuantity = existingItems[0].quantity + quantity;
      await connection.execute(
        'UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?',
        [newQuantity, existingItems[0].id]
      );
    } else {
      // เพิ่มสินค้าใหม่
      await connection.execute(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
        [req.user.id, product_id, quantity]
      );
    }

    res.json({ message: 'เพิ่มสินค้าลงตะกร้าสำเร็จ' });

  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

// อัปเดตจำนวนสินค้า
router.put('/:id', verifyToken, async (req, res) => {
  let connection;
  try {
    const { quantity } = req.body;

    if (quantity <= 0) {
      return res.status(400).json({ error: 'จำนวนต้องมากกว่า 0' });
    }

    connection = await pool.getConnection();

    // ตรวจสอบว่าเป็นของผู้ใช้
    const [cartItems] = await connection.execute(
      'SELECT * FROM cart WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({ error: 'ไม่พบสินค้าในตะกร้า' });
    }

    // ตรวจสอบสต็อก
    const [products] = await connection.execute(
      'SELECT stock FROM products WHERE id = ?',
      [cartItems[0].product_id]
    );

    if (products[0].stock < quantity) {
      return res.status(400).json({ error: 'สต็อกไม่เพียงพอ' });
    }

    await connection.execute(
      'UPDATE cart SET quantity = ?, updated_at = NOW() WHERE id = ?',
      [quantity, req.params.id]
    );

    res.json({ message: 'อัปเดตจำนวนสำเร็จ' });

  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

// ลบสินค้าจากตะกร้า
router.delete('/:id', verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // ตรวจสอบว่าเป็นของผู้ใช้
    const [cartItems] = await connection.execute(
      'SELECT * FROM cart WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (cartItems.length === 0) {
      return res.status(404).json({ error: 'ไม่พบสินค้าในตะกร้า' });
    }

    await connection.execute('DELETE FROM cart WHERE id = ?', [req.params.id]);
    res.json({ message: 'ลบสินค้าจากตะกร้าสำเร็จ' });

  } catch (error) {
    console.error('Delete from cart error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

// ลบสินค้าทั้งหมด
router.delete('/', verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.execute('DELETE FROM cart WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'ลบสินค้าในตะกร้าทั้งหมดสำเร็จ' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
