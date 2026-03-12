#!/usr/bin/env node
/**
 * Script to update product images in the database
 * Run this after copying images to frontend/public/images/
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateProductImages() {
  let connection;
  try {
    console.log('🔌 Connecting to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'flavormeup'
    });

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

    console.log(`🖼️  Updating ${imageUpdates.length} product images...`);
    
    for (const update of imageUpdates) {
      await connection.execute(
        'UPDATE products SET image_url = ? WHERE name = ?',
        [update.image, update.name]
      );
      console.log(`  ✓ ${update.name} -> ${update.image}`);
    }

    console.log('\n✅ All product images updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating images:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

updateProductImages();
