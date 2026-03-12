const express = require('express');
const { pool } = require('../config/database');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

const router = express.Router();

// ดึงคำสั่งซื้อของผู้ใช้
router.get('/', verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    let query = 'SELECT id, user_id, total_price, status, shipping_address, notes, created_at FROM orders';
    const params = [];

    if (req.user.role !== 'admin') {
      query += ' WHERE user_id = ?';
      params.push(req.user.id);
    }

    query += ' ORDER BY created_at DESC';

    const [orders] = await connection.execute(query, params);
    res.json(orders);

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

// ดึงรายละเอียดคำสั่งซื้อ
router.get('/:id', verifyToken, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    const [orders] = await connection.execute(
      'SELECT * FROM orders WHERE id = ? LIMIT 1',
      [req.params.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ error: 'ไม่พบคำสั่งซื้อ' });
    }

    const order = orders[0];

    // ตรวจสอบสิทธิ์
    if (req.user.role !== 'admin' && order.user_id !== req.user.id) {
      return res.status(403).json({ error: 'ไม่มีสิทธิ์เข้าถึง' });
    }

    // ดึงรายการสินค้าในคำสั่งซื้อ
    const [items] = await connection.execute(
      'SELECT oi.*, p.name, p.category FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?',
      [req.params.id]
    );

    res.json({ ...order, items });

  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

// สร้างคำสั่งซื้อ
router.post('/', verifyToken, async (req, res) => {
  let connection;
  try {
    const { items, shipping_address, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'ไม่มีสินค้าในคำสั่งซื้อ' });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let totalPrice = 0;

    // ตรวจสอบสต็อกและคำนวณราคา
    for (const item of items) {
      const [products] = await connection.execute(
        'SELECT price, stock FROM products WHERE id = ?',
        [item.product_id]
      );

      if (products.length === 0) {
        throw new Error('ไม่พบสินค้า: ' + item.product_id);
      }

      if (products[0].stock < item.quantity) {
        throw new Error('สต็อกไม่เพียงพอ');
      }

      totalPrice += products[0].price * item.quantity;
    }

    // สร้างคำสั่งซื้อ
    const [orderResult] = await connection.execute(
      'INSERT INTO orders (user_id, total_price, shipping_address, notes) VALUES (?, ?, ?, ?)',
      [req.user.id, totalPrice, shipping_address || '', notes || '']
    );

    const orderId = orderResult.insertId;

    // บันทึกรายการสินค้า
    for (const item of items) {
      const [products] = await connection.execute(
        'SELECT price FROM products WHERE id = ?',
        [item.product_id]
      );

      await connection.execute(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.product_id, item.quantity, products[0].price]
      );

      // อัปเดตสต็อก
      await connection.execute(
        'UPDATE products SET stock = stock - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

    // ลบรายการในตะกร้า
    await connection.execute(
      'DELETE FROM cart WHERE user_id = ?',
      [req.user.id]
    );

    await connection.commit();

    res.status(201).json({
      message: 'สร้างคำสั่งซื้อสำเร็จ',
      orderId,
      totalPrice
    });

  } catch (error) {
    await connection?.rollback();
    console.error('Create order error:', error);
    res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาد' });
  } finally {
    if (connection) connection.release();
  }
});

// อัปเดตสถานะคำสั่งซื้อ (Admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  let connection;
  try {
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'สถานะไม่ถูกต้อง' });
    }

    connection = await pool.getConnection();
    await connection.execute(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, req.params.id]
    );

    res.json({ message: 'อัปเดตสถานะสำเร็จ' });

  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
