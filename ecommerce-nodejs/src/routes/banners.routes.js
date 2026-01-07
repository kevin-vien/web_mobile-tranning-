// Import thư viện Express để tạo router
const express = require('express');

// Import middleware authentication
// authenticate: Kiểm tra user đã đăng nhập
// authorizeAdmin: Kiểm tra user có quyền admin
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Import hàm defineModels để lấy các model
const { defineModels } = require('../models');

// Gọi defineModels() để lấy model Banner
const { Banner } = defineModels();

// Tạo Express Router instance cho banners routes
const router = express.Router();

// Route GET /api/banners: Lấy danh sách tất cả banner
// Không cần đăng nhập, ai cũng có thể xem banner (hiển thị trên trang chủ)
router.get('/', async (req, res) => {
  try {
    // Lấy tất cả banner từ database
    // Banner.findAll(): Tìm tất cả records trong bảng banners
    const banners = await Banner.findAll();
    
    // Trả về danh sách banner (Sequelize tự động serialize)
    const bannersData = banners.map(b => b.toJSON ? b.toJSON() : b);
    return res.json(bannersData);
  } catch (err) {
    // Log lỗi để debug
    console.error('Error in /api/banners:', err);
    // Nếu có lỗi → trả lỗi 500 Internal Server Error
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Route POST /api/banners: Tạo banner mới (CHỈ ADMIN)
// authenticate: Phải đăng nhập
// authorizeAdmin: Phải là admin
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Tạo banner mới từ dữ liệu trong request body
    // req.body chứa: title, image_url, link
    const banner = await Banner.create(req.body);
    
    // Trả về banner vừa tạo với HTTP status 201 Created
    return res.status(201).json(banner);
  } catch (err) {
    // Nếu có lỗi (dữ liệu không hợp lệ, v.v.) → trả lỗi 400 Bad Request
    return res.status(400).json({ message: 'Invalid data' });
  }
});

// Export router để file routes/index.js có thể sử dụng
module.exports = router;



















