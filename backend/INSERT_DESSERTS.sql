-- เพิ่มรายการขนมหวาน 6 รายการ

INSERT INTO products (name, description, category, price, image_url, stock, created_at, updated_at) VALUES
('Croissant', 'ครัวซอนต์อบนอบแนนแนนหลุด', 'pastry', 35.00, 'croissant.jpg', 100, NOW(), NOW()),
('Cookies', 'คุกกี้แสนอร่อยนำเสนอวาฟัวแนนแสนเศร', 'pastry', 30.00, 'cookies.jpg', 100, NOW(), NOW()),
('Moji', 'ชาวเแฮดดี้ ลิงวนแนนควัดเกลศรินนปไขข่า', 'pastry', 45.00, 'moji.jpg', 100, NOW(), NOW()),
('MatchaRoll', 'ม้าแร็นวินนแนนแนนเสนการโต้รถ', 'pastry', 60.00, 'matcharoll.jpg', 100, NOW(), NOW()),
('Strawberry Shortcake', 'เค้กเตือนบูนินคิรณแสนฐานแนนเปรียวอบนโลาย', 'cake', 50.00, 'strawberry_shortcake.jpg', 100, NOW(), NOW()),
('Chocolate Cake', 'เค้กเชือนโลดชี้ ข้างกองบบค้นกรอกโตแนเต', 'cake', 65.00, 'chocolate_cake.jpg', 100, NOW(), NOW());
