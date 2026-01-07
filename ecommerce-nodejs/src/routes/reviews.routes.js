// Import thư viện Express để tạo router
const express = require('express');

// Import middleware authenticate để kiểm tra user đã đăng nhập
const { authenticate } = require('../middleware/auth');

// Import hàm defineModels để lấy các model
const { defineModels } = require('../models');

// Gọi defineModels() để lấy model Review
const { Review } = defineModels();

// Tạo Express Router instance cho reviews routes
const router = express.Router();

// Route POST /api/reviews: Tạo đánh giá mới cho sản phẩm
// authenticate: Phải đăng nhập mới viết được đánh giá
router.post('/', authenticate, async (req, res) => {
  try {
    // Lấy dữ liệu từ request body
    // product_id: ID sản phẩm được đánh giá
    // rating: Điểm đánh giá (ví dụ: 1-5 sao)
    // comment: Nội dung đánh giá (không bắt buộc)
    const { product_id, rating, comment } = req.body;
    
    // Tạo đánh giá mới trong database
    // user_id: Lấy từ req.user (đã được authenticate middleware set từ JWT token)
    const review = await Review.create({ 
      product_id, 
      user_id: req.user.user_id,  // ID user viết đánh giá (từ token)
      rating, 
      comment 
    });
    
    // Trả về đánh giá vừa tạo với HTTP status 201 Created
    return res.status(201).json(review);
  } catch (err) {
    // Nếu có lỗi (dữ liệu không hợp lệ, v.v.) → trả lỗi 400 Bad Request
    return res.status(400).json({ message: 'Invalid data' });
  }
});

// Route GET /api/reviews/:product_id: Lấy danh sách đánh giá của một sản phẩm
// Không cần đăng nhập, ai cũng có thể xem đánh giá
// :product_id là ID sản phẩm cần xem đánh giá
router.get('/:product_id', async (req, res) => {
  try {
    // Tìm tất cả đánh giá của sản phẩm có product_id = req.params.product_id
    // Review.findAll({ where: { product_id: ... } }): Tìm tất cả reviews có product_id khớp
    const reviews = await Review.findAll({ where: { product_id: req.params.product_id } });
    
    // Trả về danh sách đánh giá
    return res.json(reviews);
  } catch (err) {
    // Nếu có lỗi → trả lỗi 500 Internal Server Error
    return res.status(500).json({ message: 'Server error' });
  }
});

// Export router để file routes/index.js có thể sử dụng
module.exports = router;



















