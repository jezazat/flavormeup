-- MySQL Database Migration Script
-- From Old PHP System to New React + Node.js System
-- Run this after creating the new database

-- ============================================
-- 1. CREATE NEW PRODUCTS TABLE (from drinks)
-- ============================================

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL,
  image_url VARCHAR(255),
  stock INT DEFAULT 100,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 2. MIGRATE DATA: drinks → products
-- ============================================

INSERT INTO products (name, description, category, price, image_url, stock)
SELECT 
  name,
  description,
  'beverage' as category,  -- default category
  price,
  CONCAT(image, '') as image_url,
  100 as stock  -- default stock
FROM drinks;

-- ============================================
-- 3. UPDATE USERS TABLE - ADD EMAIL
-- ============================================

ALTER TABLE users ADD COLUMN email VARCHAR(100) UNIQUE AFTER username;

-- Add placeholder emails for existing users
UPDATE users SET email = CONCAT(username, '@flavormeup.local') WHERE email IS NULL;

-- ============================================
-- 4. CREATE NEW CART TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS cart_new (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 5. MIGRATE DATA: old cart → cart_new
-- ============================================

INSERT INTO cart_new (user_id, product_id, quantity)
SELECT 
  user_id,
  drink_id as product_id,
  quantity
FROM cart
GROUP BY user_id, drink_id;

-- ============================================
-- 6. REPLACE OLD CART WITH NEW CART
-- ============================================

DROP TABLE IF EXISTS cart_old;
ALTER TABLE cart RENAME TO cart_old;
ALTER TABLE cart_new RENAME TO cart;

-- ============================================
-- 7. CREATE NEW ORDERS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS orders_new (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  shipping_address TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 8. CREATE ORDER ITEMS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders_new(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 9. MIGRATE OLD ORDERS DATA
-- ============================================

-- Insert old orders as completed orders
INSERT INTO orders_new (user_id, total_price, status, created_at)
SELECT 
  user_id,
  total_price,
  'completed' as status,
  order_time as created_at
FROM orders;

-- Add some default shipping addresses for old orders
UPDATE orders_new SET shipping_address = 'Legacy Order - No address recorded' 
WHERE shipping_address IS NULL OR shipping_address = '';

-- ============================================
-- 10. REPLACE OLD ORDERS WITH NEW ORDERS
-- ============================================

DROP TABLE IF EXISTS orders_old;
ALTER TABLE orders RENAME TO orders_old;
ALTER TABLE orders_new RENAME TO orders;

-- ============================================
-- 11. CREATE SESSIONS TABLE (optional)
-- ============================================

CREATE TABLE IF NOT EXISTS sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- 12. VERIFY MIGRATION
-- ============================================

-- Show migration summary
SELECT 'MIGRATION SUMMARY' as Status;
SELECT CONCAT('Total Products: ', COUNT(*)) from products;
SELECT CONCAT('Total Users: ', COUNT(*)) from users;
SELECT CONCAT('Total Orders: ', COUNT(*)) from orders;
SELECT CONCAT('Total Cart Items: ', COUNT(*)) from cart;
