const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function importSQL() {
  console.log('Starting SQL import process...');

  const host = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
  const user = process.env.MYSQLUSER || process.env.DB_USER || 'root';
  const password = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '';
  const database = process.env.MYSQLDATABASE || process.env.DB_NAME || 'flavormeup';
  const port = process.env.MYSQLPORT || process.env.DB_PORT || 3306;

  console.log(`Connecting to database at ${host}:${port}...`);

  try {
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database,
      port,
      multipleStatements: true // สำคัญมาก เพื่อให้รันคำสั่ง SQL หลายๆ อันพร้อมกันได้
    });

    console.log('✓ Database connected successfully');

    // อ่านไฟล์ SQL
    const sqlFilePath = path.join(__dirname, '..', '..', 'flavormeup.sql');
    console.log(`Reading SQL file from: ${sqlFilePath}`);
    
    if (!fs.existsSync(sqlFilePath)) {
       throw new Error(`File not found at ${sqlFilePath}`);
    }

    const sqlScript = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Executing SQL script...');
    
    // รันคำสั่ง SQL
    await connection.query(sqlScript);

    console.log('✓ SQL import completed successfully! 🎉');
    
    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('✗ Error importing SQL:', error);
    process.exit(1);
  }
}

importSQL();
