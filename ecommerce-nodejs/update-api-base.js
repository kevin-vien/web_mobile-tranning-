#!/usr/bin/env node
/**
 * Script để tự động cập nhật API_BASE trong các file HTML frontend
 * Sử dụng: node update-api-base.js
 * Hoặc: node update-api-base.js https://your-domain.com
 */

const fs = require('fs');
const path = require('path');

// Lấy API base URL từ tham số dòng lệnh hoặc biến môi trường
const apiBase = process.argv[2] || process.env.API_BASE || 'http://localhost:3000/api';
const frontendDir = path.join(__dirname, '..', 'frontend-html');

// Danh sách các file HTML cần cập nhật
const htmlFiles = [
  'index.html',
  'login.html',
  'register.html',
  'checkout.html',
  'product_detail.html',
  'promotion.html',
  'change_password.html',
  'news.html'
];

console.log(`Đang cập nhật API_BASE thành: ${apiBase}`);

htmlFiles.forEach(file => {
  const filePath = path.join(frontendDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File không tồn tại: ${file}`);
    return;
  }

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Tìm và thay thế API_BASE
    const oldPattern = /const\s+API_BASE\s*=\s*['"]([^'"]+)['"]/;
    const newLine = `const API_BASE = '${apiBase}';`;
    
    if (oldPattern.test(content)) {
      content = content.replace(oldPattern, newLine);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Đã cập nhật: ${file}`);
    } else {
      console.log(`⚠️  Không tìm thấy API_BASE trong: ${file}`);
    }
  } catch (error) {
    console.error(`❌ Lỗi khi cập nhật ${file}:`, error.message);
  }
});

console.log('\n✅ Hoàn tất cập nhật!');




