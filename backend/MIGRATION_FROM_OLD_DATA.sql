-- ==========================================
-- Migration Script from Old FlavorMeUp DB
-- ==========================================

-- Step 1: Create new database structure
CREATE DATABASE IF NOT EXISTS flavormeup;
USE flavormeup;

-- Step 2: Create tables for new system
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category VARCHAR(50),
  stock INT DEFAULT 100,
  image_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cart (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY unique_cart (user_id, product_id),
  INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  INDEX idx_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==========================================
-- Step 3: IMPORT OLD DATA FROM INFINITYFREE
-- ==========================================

-- Import old users (ข้อมูลเก่า 50 users)
INSERT INTO users (id, username, email, password, role, created_at) VALUES
(3, 'kk', 'kk@flavormeup.com', '$2y$10$fRP7tDx1gtAGEYH9XywNfu.XiniK8PNEqGCDagxIQN4XkMlFj/KjO', 'user', NOW()),
(8, 'armin', 'armin@flavormeup.com', '$2y$10$xE15fZJMwbeiLCRzwxIHx.F.7JpubF.1Sg/yzFCqz9Zv2FweyB59K', 'user', NOW()),
(10, 'tub', 'tub@flavormeup.com', '$2y$10$1OBnbfFJQhBMwhN1gabdBuslDvaaEHpYnUN55v7o296d2p82jrNj6', 'user', NOW()),
(12, 'admin', 'admin@flavormeup.com', '$2y$10$8H8vspvHAM8/M.sUL.alTOBTtVdVvgSnmZubKsuJGFnwrh0bPXZBS', 'admin', NOW()),
(14, 'jzz', 'jzz@flavormeup.com', '$2y$10$ULLl/Q4qodfaf1SlYA/4EON7A6fu7JpTSS/kRJAXjYrZKXm4baWtm', 'user', NOW()),
(15, 'freshy', 'freshy@flavormeup.com', '$2y$10$MSHitag79O5hEg0BXYPUzOn3oKHWd0FmBMp7dRLSCclV8487AllWW', 'user', NOW()),
(21, 'jean', 'jean@flavormeup.com', '$2y$10$maqaa5aGRRV5OBO1Q4wZgeNIwjwvq3OGoLvTh4zBzVkz0jgIXz9Mm', 'user', NOW()),
(22, 'gam', 'gam@flavormeup.com', '$2y$10$mkA1/DEnWVQWj8ZTcVnZduUVJCCv7Zp1Em6/uunAAfHogrZ7RWKxW', 'user', NOW()),
(31, 'phuriphat', 'phuriphat@flavormeup.com', '$2y$10$z8B63tRe9hGYP7.SiBE8GOyGmuVq/xt3WsCGvWq0PvjYiAc4cjP0K', 'user', NOW()),
(32, 'mhan', 'mhan@flavormeup.com', '$2y$10$ni.CrIOnj3Y2CxRm0Det2OTFeD.aL5u9SeMC6MxCkCws4XF0Nv83e', 'user', NOW()),
(33, 'cn', 'cn@flavormeup.com', '$2y$10$2OL.Aj9Ors4cUz/4G5Gd9u8p58YVAsfq/8S9IXeufbSfrBhZSXFrO', 'user', NOW()),
(34, 'ff', 'ff@flavormeup.com', '$2y$10$/a00bljqc4uHx6adSp3uGuEHFIHSrwf/eLV8PwP.lDjk8qaoAbU.u', 'user', NOW()),
(35, 'meen', 'meen@flavormeup.com', '$2y$10$YToEhL9fg2rDYfg.Hu6HwOZ4tndUqrtD/gvj2SalPtotJ3ga5pv1W', 'user', NOW()),
(36, 'gamsai', 'gamsai@flavormeup.com', '$2y$10$VucVKwXdQ5kdv/9DFUA9/.C6Ih3N2Yx6ijzo9nDpJ43EAmnXJFUeG', 'user', NOW()),
(39, 'gg', 'gg@flavormeup.com', '$2y$10$R3ZyVSMDEBQSnQCQn4FL/OCI0dYU4YGhOQRsvmsfApEWdzhn./FIG', 'user', NOW()),
(42, 'อิน', 'in@flavormeup.com', '$2y$10$gcwW7um5sGS8rFL4s2lNGeuqIFlhkaaw4HDOfeV1gPMJaaIb9L8ta', 'user', NOW()),
(44, 'Abcc', 'abcc@flavormeup.com', '$2y$10$x3ww8C9.JT/oyk42xWOYX./r/qv9YKpSWGaXdcj5OkfRpLzw8ydh6', 'user', NOW()),
(45, '👧🏻', 'girl@flavormeup.com', '$2y$10$82HPjvkH4i1EtGCcE7/8tuPyVDhJTYA3tj2T8RjIKdXVMWq5Fmx/G', 'user', NOW()),
(46, 'abc', 'abc@flavormeup.com', '$2y$10$xsvdKREBwr9tjaA677162.1cs0PSirRaIBDQzMIXKeL7CXiCD9I4C', 'user', NOW()),
(47, 'มีนจ้า', 'mineja@flavormeup.com', '$2y$10$0HpcL2iWrhA.l5XmB/UH0OX3aBlTmFTv5jEu5GFiIU7/1/AmQpDem', 'user', NOW()),
(48, 'best', 'best@flavormeup.com', '$2y$10$NzbI9Z/eqBMYFoP6P3MLwuoiBWaMOGnKZiBKUM9L1rrGDeFFbvuC2', 'user', NOW()),
(49, 'cin', 'cin@flavormeup.com', '$2y$10$gXDGyJkUR3KrRJkAXuvZrOtWmssAePdnmj0sRVsHxxt934orlEg7K', 'user', NOW()),
(50, 'Wisoot', 'wisoot@flavormeup.com', '$2y$10$vGfX1XR5yBkJABQUWVYK8uah8ESSyIOoqRxaFpTpt78ArAPHv397u', 'user', NOW());

-- Update AUTO_INCREMENT for users
ALTER TABLE users AUTO_INCREMENT = 51;

-- ==========================================
-- Import old products (drinks - 18 items)
-- ==========================================

INSERT INTO products (id, name, description, price, category, stock, image_url, created_at) VALUES
(1, 'Espresso', 'ดื่มเอสเพรสโซ่ทีเดียวเหมือนโดนตบให้ตื่น', 50.00, 'coffee', 100, 'espresso.png', NOW()),
(2, 'Latte', 'อย่ามัวแต่ปั่นงาน มาปั่นลาเต้ก่อนมั้ย?', 60.00, 'coffee', 100, 'latte.png', NOW()),
(3, 'Mocha', 'ดื่มมอคค่าแล้วตื่นจริง แต่ตื่นมาเจองานคืออยากนอนต่อ', 65.00, 'coffee', 100, 'mocha.png', NOW()),
(4, 'Green Tea', 'ดื่มชาเขียวให้ใจสงบ แล้วนั่งงงกับชีวิตต่อ', 45.00, 'tea', 100, 'greentea3.png', NOW()),
(5, 'Thai Tea', 'ชาไทยหวานจริง ไม่ต้องเติมน้ำตาล', 50.00, 'tea', 100, 'chaaathai.png', NOW()),
(6, 'Lemon Tea', 'เปรี้ยวๆ สดชื่น เหมือนตอนโดนหักคะแนน', 50.00, 'tea', 100, 'lemontea.png', NOW()),
(7, 'Fresh Milk', 'นมสดนี่แหละตัวจริง หวานมันละลายใจ ดื่มทีเหมือนได้จุ๊บน้องวัว', 40.00, 'milk', 100, 'milk.png', NOW()),
(8, 'Ice Pink Milk', 'หวานเหมือนเด็ก แต่เจอเรื่องจริงก็แทบร้องไห้', 45.00, 'milk', 100, 'pinkmilk.png', NOW()),
(9, 'Cocoa Milk', 'โกโก้เข้มข้น แต่ชีวิตยังบางอยู่ดี', 50.00, 'milk', 100, 'cocoa.png', NOW()),
(10, 'Blue Hawaii Soda', 'ฟ้าสวย น้ำใส แต่ในใจยังวุ่นวายอยู่', 55.00, 'soda', 100, 'bluesoda3.png', NOW()),
(11, 'Peach Soda', 'ซ่าหวาน สดใส เหมือนคนที่ยังไม่โดนงานถาโถม', 50.00, 'soda', 100, 'peachsoda.png', NOW()),
(12, 'Strawberry Soda', 'สีหวานน่ารัก แต่พอหมดแก้วก็แค่โซดาเหมือนกัน', 50.00, 'soda', 100, 'stsoda.png', NOW()),
(13, 'Croissant', 'ครัวซองต์กรอบจนฟันเแทบหลุด', 35.00, 'pastry', 100, 'croissant.png', NOW()),
(14, 'Cookies', 'คุกกี้กัดแล้วเหมือนมีสายฟ้าผ่าลงปากกรุบและหวานพร้อมกัน', 30.00, 'pastry', 100, 'cookies.png', NOW()),
(15, 'Moji', 'ข้างในแดงฉ่ำ ข้างนอกนุ่มหยุ่น กัดทีนี่มันไฟลุก', 45.00, 'pastry', 100, 'moji.png', NOW()),
(16, 'MatchaRoll', 'กัดแล้วฟูจนหูแทบหลุด แต่ใจยังอยากกัดโรลอีก', 60.00, 'pastry', 100, 'matcharoll.png', NOW()),
(17, 'Strawberry Shortcake', 'เค้กเนื้อนุ่มกับครีมสดและสตรอเบอร์รี่สดรสหวานอมเปรี้ยวละมุนละไม 🍓', 50.00, 'cake', 100, 'strawberryshort.jpg', NOW()),
(18, 'Chocolate Cake', 'เค้กเนื้อนุ่มชุ่มฉ่ำ, ทำจากผงโกโก้หรือช็อกโกแลตแท้', 65.00, 'cake', 100, 'cakecoco.jpg', NOW());

-- Update AUTO_INCREMENT for products
ALTER TABLE products AUTO_INCREMENT = 19;

-- ==========================================
-- Create old orders as "completed" status
-- ==========================================

-- Insert old order history (from old orders table)
INSERT INTO orders (id, user_id, total_amount, status, created_at) VALUES
(1, 12, 50.00, 'completed', NOW()),
(2, 12, 20.00, 'completed', NOW()),
(3, 12, 20.00, 'completed', NOW());

-- Update AUTO_INCREMENT for orders
ALTER TABLE orders AUTO_INCREMENT = 4;

-- ==========================================
-- ข้อมูลสรุป
-- ==========================================
-- ✅ Users: 19 users imported (from old system)
-- ✅ Products: 18 drinks imported
-- ✅ Orders: 3 completed orders from history
-- ✅ Stock: All products set to 100 units
-- ✅ Roles: Preserved admin role (user id 12)
-- ✅ Passwords: Kept original bcrypt hashes (2y)
-- ✅ Charset: utf8mb4 for Thai language support
