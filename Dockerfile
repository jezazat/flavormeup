# 1. ใช้ Node.js Image โดยตรง (ไม่ต้องผ่าน Nixpacks Ubuntu เปล่าๆ)
FROM node:18-alpine

# 2. ตั้งค่าโฟลเดอร์ทำงาน
WORKDIR /app

# 3. ก๊อปปี้ไฟล์ package.json จากใน backend มาเพื่อลง lib
COPY backend/package*.json ./

# 4. ลง dependencies (คราวนี้ npm มาแน่นอน เพราะเราใช้ Image node)
RUN npm install

# 5. ก๊อปปี้ไฟล์ทั้งหมดจากโฟลเดอร์ backend เข้ามาในเครื่อง
COPY backend/ .

# 6. บอก Port (Node.js ปกติใช้ 3000 หรือตามที่แกเซ็ตใน server.js)
EXPOSE 5000

# 7. สั่งรัน!
CMD ["node", "server.js"]