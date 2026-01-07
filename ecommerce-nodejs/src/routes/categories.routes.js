// Import thư viện Express để tạo router
const express = require('express');

// Import middleware authentication
// authenticate: Kiểm tra user đã đăng nhập
// authorizeAdmin: Kiểm tra user có quyền admin
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Import controller chứa các hàm xử lý logic cho categories
const controller = require('../controllers/category.controller');

// Tạo Express Router instance cho categories routes
const router = express.Router();

// Route GET /api/categories: Lấy danh sách tất cả danh mục
// Không cần đăng nhập, ai cũng có thể xem danh sách danh mục
router.get('/', controller.listCategories);

// Route POST /api/categories: Tạo danh mục mới (CHỈ ADMIN)
// authenticate: Phải đăng nhập
// authorizeAdmin: Phải là admin
router.post('/', authenticate, authorizeAdmin, controller.createCategory);

// Route PUT /api/categories/:id: Cập nhật danh mục (CHỈ ADMIN)
// :id là ID của danh mục cần cập nhật
router.put('/:id', authenticate, authorizeAdmin, controller.updateCategory);

// Route DELETE /api/categories/:id: Xóa danh mục (CHỈ ADMIN)
// :id là ID của danh mục cần xóa
router.delete('/:id', authenticate, authorizeAdmin, controller.deleteCategory);

// Export router để file routes/index.js có thể sử dụng
module.exports = router;



















