# Database Migration Guide

## 📋 Overview

ไฟล์นี้ช่วยในการย้ายข้อมูลจากระบบเก่า (PHP) ไปยังระบบใหม่ (React + Node.js)

## 🔄 What Gets Migrated

### ✅ Tables Migrated:

1. **drinks → products**
   - ชื่อ (name)
   - คำอธิบาย (description)
   - ราคา (price)
   - รูปภาพ (image)
   - Category: ตั้งค่าเป็น "beverage" (สามารถเปลี่ยนได้)
   - Stock: ตั้งค่าเป็น 100 สำหรับทุกรายการ

2. **users → users** (with enhancements)
   - Username
   - Password
   - Role (user/admin)
   - Email: สร้างอัตโนมัติจาก username

3. **orders → orders** (restructured)
   - เก่า: ตารางเดียวเก็บทั้งหมด
   - ใหม่: แยกเป็น orders + order_items

4. **cart** (reorganized)
   - เก่า: เก็บสินค้าโดยละเอียด
   - ใหม่: ทำให้เรียบง่ายขึ้น

## 🚀 How to Migrate

### Step 1: Backup Old Database

```bash
# Optional: Backup your old database first
mysqldump -u root -p if0_40096812_Flavor > backup_old_database.sql
```

### Step 2: Create New Database

```bash
# Open MySQL
mysql -u root -p

# Create new database for new system
CREATE DATABASE flavormeup;
use flavormeup;
```

### Step 3: Load Migration Script

```bash
# Option A: From command line
mysql -u root -p flavormeup < MIGRATION_FROM_OLD_DATABASE.sql

# Option B: In MySQL CLI
source MIGRATION_FROM_OLD_DATABASE.sql;
```

### Step 4: Verify Migration

```sql
-- Check products
SELECT COUNT(*) as total_products FROM products;

-- Check users
SELECT COUNT(*) as total_users FROM users;

-- Check orders
SELECT COUNT(*) as total_orders FROM orders;

-- Check specific data
SELECT * FROM products LIMIT 5;
SELECT * FROM users LIMIT 5;
```

## 📊 Data Mapping

### Products
```
OLD drinks table:
- id → id
- name → name
- description → description
- price → price
- image → image_url
- (new) category → "beverage"
- (new) stock → 100
```

### Users
```
OLD users table:
- id → id
- username → username
- password → password
- role → role
- (new) email → generated from username
```

### Orders
```
OLD orders table:
- id → id
- user_id → user_id
- drink_name → (removed, use order_items instead)
- sweetness → (moved to notes)
- quantity → (moved to order_items)
- total_price → total_price
- order_time → created_at
- (new) status → "completed" (all old orders marked as completed)
- (new) shipping_address → default value
```

## ⚠️ Important Notes

### What Changed:

1. **Field Removals**
   - `sugar_level`: ถูกลบออก (สามารถเพิ่มเป็น notes ใน order ได้)
   - `drink_name`: แทนที่ด้วย product relationship

2. **Data Adjustments**
   - Old orders: ตั้งค่า status เป็น "completed"
   - Cart: ลบข้อมูลซ้ำออก group by user + product
   - Emails: สร้างจาก username

3. **New Fields**
   - `products.category`: "beverage"
   - `products.stock`: 100
   - `products.created_at/updated_at`: Timestamps
   - `orders.status`: Status tracking
   - `orders.shipping_address`: Address storage

## 🔧 Post-Migration Tasks

### 1. Update Product Categories

```sql
-- Categorize beverages more accurately
UPDATE products SET category = 'coffee' WHERE name IN ('Espresso', 'Latte', 'Mocha');
UPDATE products SET category = 'tea' WHERE name IN ('Green Tea', 'Thai Tea', 'Lemon Tea');
UPDATE products SET category = 'smoothie' WHERE name IN ('Fresh Milk', 'Ice Pink Milk', 'Cocoa Milk');
UPDATE products SET category = 'soda' WHERE name LIKE '%Soda%';
UPDATE products SET category = 'pastry' WHERE name IN ('Croissant', 'Cookies', 'Moji', 'MatchaRoll');
UPDATE products SET category = 'cake' WHERE name LIKE '%Cake%';
```

### 2. Update Product Stock

```sql
-- Adjust stock levels as needed
UPDATE products SET stock = 50 WHERE category IN ('coffee', 'tea');
UPDATE products SET stock = 30 WHERE category IN ('pastry', 'cake');
UPDATE products SET stock = 25 WHERE category = 'soda';
```

### 3. Update Product Images

```sql
-- Update image URLs to point to correct location
UPDATE products SET image_url = CONCAT('/images/products/', image_url);
```

### 4. Verify User Emails

```sql
-- Check generated emails
SELECT id, username, email FROM users LIMIT 10;

-- Update specific emails if needed
UPDATE users SET email = 'admin@flavormeup.com' WHERE username = 'admin';
```

## 🐛 Troubleshooting

### Foreign Key Errors

If you get foreign key constraint errors:

```sql
-- Temporarily disable foreign key checks
SET FOREIGN_KEY_CHECKS=0;

-- Run migration script
-- Then re-enable
SET FOREIGN_KEY_CHECKS=1;
```

### Encoding Issues

If Thai characters appear corrupted:

```sql
-- Set correct charset
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- Your migration commands here
```

### Duplicate Key Error

If there are duplicate entries:

```sql
-- Clean up and try again
DELETE FROM cart WHERE id IN (
  SELECT DISTINCT id FROM (
    SELECT id, ROW_NUMBER() OVER(PARTITION BY user_id, product_id ORDER BY id) as rn
    FROM cart
  ) t WHERE rn > 1
);
```

## 📈 Verification Checklist

After migration, verify:

- [ ] Total products: 18 items
- [ ] Total users: 50 users
- [ ] All orders marked as "completed"
- [ ] All cart items properly assigned
- [ ] All emails generated
- [ ] Foreign key relationships intact
- [ ] No NULL values in critical fields
- [ ] Thai characters display correctly

## 🔙 Rollback Plan

If something goes wrong:

### Option 1: From Backup
```bash
mysql -u root -p flavormeup < backup_old_database.sql
```

### Option 2: Manual Restore

```sql
-- Drop problematic tables
DROP TABLE IF EXISTS cart, orders, products;

-- Recreate from old system
-- And start migration again
```

## 📝 Next Steps

After successful migration:

1. Update `.env` file with new database name: `flavormeup`
2. Restart backend server
3. Test all features with old user accounts
4. Verify all products display correctly
5. Test checkout with old order data

---

**Migration Date:** 2026-02-26
**From:** PHP + HTML System
**To:** React + Node.js System
