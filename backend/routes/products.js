const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../config/database');
const { verifyAdmin, verifyToken } = require('../middleware/auth');

const router = express.Router();

// ตั้งค่า multer สำหรับอัปโหลดรูปภาพ
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('รูปภาพต้องเป็นไฟล์型ประเภท jpeg, jpg, png, gif หรือ webp'));
    }
  }
});

// ดึงรายการสินค้าทั้งหมด (รวมสินค้าที่หมด)
router.get('/admin/all', verifyAdmin, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [products] = await connection.execute(
      'SELECT id, name, description, category, price, image_url, stock FROM products ORDER BY created_at DESC'
    );
    res.json(products);
  } catch (error) {
    console.error('Get all products error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
  } finally {
    if (connection) connection.release();
  }
});

// อัปโหลดรูปภาพ (Admin only)
router.post('/upload-image', verifyAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'ไม่มีไฟล์ที่เลือก' });
    }

    // Store only filename for consistency with image loading in frontend
    const imageUrl = req.file.filename;
    res.json({
      message: 'อัปโหลดรูปภาพสำเร็จ',
      imageUrl: imageUrl,
      filename: req.file.filename,
      fullUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/uploads/${req.file.filename}`
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ' });
  }
});

// ดึงรายการสินค้าทั้งหมด
router.get('/', async (req, res) => {
  let connection;
  try {
    const { category, search } = req.query;
    connection = await pool.getConnection();

    let query = 'SELECT id, name, description, category, price, image_url, stock FROM products WHERE stock > 0';
    const params = [];

    if (category) {
      if (category === 'dessert') {
        query += ' AND category IN (?, ?)';
        params.push('cake', 'pastry');
      } else {
        query += ' AND category = ?';
        params.push(category);
      }
    }

    if (search) {
      query += ' AND (name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const [products] = await connection.execute(query, params);
    res.json(products);

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการดึงข้อมูลสินค้า' });
  } finally {
    if (connection) connection.release();
  }
});

// ดึงรายละเอียดสินค้า
router.get('/:id', async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [products] = await connection.execute(
      'SELECT * FROM products WHERE id = ? LIMIT 1',
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }

    res.json(products[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

// เพิ่มสินค้า (Admin only)
router.post('/', verifyAdmin, async (req, res) => {
  let connection;
  try {
    const { name, description, category, price, image_url, stock } = req.body;

    if (!name || !price) {
      return res.status(400).json({ error: 'กรุณากรอกชื่อและราคา' });
    }

    connection = await pool.getConnection();
    const [result] = await connection.execute(
      'INSERT INTO products (name, description, category, price, image_url, stock) VALUES (?, ?, ?, ?, ?, ?)',
      [name, description || '', category || '', price, image_url || '', stock || 0]
    );

    res.status(201).json({
      message: 'เพิ่มสินค้าสำเร็จ',
      id: result.insertId
    });

  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเพิ่มสินค้า' });
  } finally {
    if (connection) connection.release();
  }
});

// แก้ไขสินค้า (Admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  let connection;
  try {
    const { name, description, category, price, image_url, stock } = req.body;
    connection = await pool.getConnection();

    await connection.execute(
      'UPDATE products SET name=?, description=?, category=?, price=?, image_url=?, stock=? WHERE id=?',
      [name, description, category, price, image_url, stock, req.params.id]
    );

    res.json({ message: 'แก้ไขสินค้าสำเร็จ' });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาด' });
  } finally {
    if (connection) connection.release();
  }
});

// ลบสินค้า (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // ลบรายการจากตะกร้า
    await connection.execute('DELETE FROM cart WHERE product_id = ?', [req.params.id]);
    
    // ลบรายการจากคำสั่งซื้อ
    await connection.execute('DELETE FROM order_items WHERE product_id = ?', [req.params.id]);
    
    // ลบสินค้า
    const [result] = await connection.execute('DELETE FROM products WHERE id = ?', [req.params.id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'ไม่พบสินค้า' });
    }
    
    res.json({ message: 'ลบสินค้าสำเร็จ' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: error.message || 'เกิดข้อผิดพลาดในการลบสินค้า' });
  } finally {
    if (connection) connection.release();
  }
});

// อัปเดตรูปภาพสินค้า (Admin only)
router.post('/update-images', verifyAdmin, async (req, res) => {
  let connection;
  try {
    connection = await pool.getConnection();

    // อัปเดตรูปภาพสินค้า
    const imageUpdates = [
      { name: 'Espresso', image: 'espresso.png' },
      { name: 'Latte', image: 'latte.png' },
      { name: 'Mocha', image: 'mocha.png' },
      { name: 'Green Tea', image: 'greentea3.png' },
      { name: 'Thai Tea', image: 'chaaathai.png' },
      { name: 'Lemon Tea', image: 'lemontea.png' },
      { name: 'Fresh Milk', image: 'milk.png' },
      { name: 'Ice Pink Milk', image: 'pinkmilk.png' },
      { name: 'Cocoa Milk', image: 'cocoa.png' },
      { name: 'Blue Hawaii Soda', image: 'bluesoda3.png' },
      { name: 'Peach Soda', image: 'peachsoda.png' },
      { name: 'Strawberry Soda', image: 'stsoda.png' },
      { name: 'Croissant', image: 'croissant.png' },
      { name: 'Cookies', image: 'cookies.png' },
      { name: 'Moji', image: 'moji.png' },
      { name: 'MatchaRoll', image: 'matcharoll.png' },
      { name: 'Strawberry Shortcake', image: 'strawberryshort.jpg' },
      { name: 'Chocolate Cake', image: 'cakecoco.jpg' }
    ];

    for (const update of imageUpdates) {
      await connection.execute(
        'UPDATE products SET image_url = ? WHERE name = ?',
        [update.image, update.name]
      );
    }

    res.json({ message: 'อัปเดตรูปภาพสำเร็จ', count: imageUpdates.length });

  } catch (error) {
    console.error('Update images error:', error);
    res.status(500).json({ error: 'เกิดข้อผิดพลาดในการอัปเดตรูปภาพ' });
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
