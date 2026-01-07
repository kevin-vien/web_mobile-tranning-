// Import thư viện Express để tạo router
const express = require('express');

// Import middleware authentication từ file auth.js
// authenticate: Kiểm tra user đã đăng nhập chưa (có token hợp lệ không)
// authorizeAdmin: Kiểm tra user có quyền admin không (chỉ admin mới được truy cập)
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Import controller chứa các hàm xử lý logic cho products
// Controller sẽ xử lý business logic và tương tác với database
const controller = require('../controllers/product.controller');

// Tạo Express Router instance cho products routes
const router = express.Router();

// Routes cho các trang đặc biệt (PHẢI đặt trước /:id)
// Lý do: Express match routes theo thứ tự, nếu /:id đặt trước thì /promotion sẽ bị match như /:id
// GET /api/products/promotion: Lấy danh sách sản phẩm khuyến mãi
router.get('/promotion', controller.getPromotionProducts);
// GET /api/products/new: Lấy danh sách sản phẩm mới về
router.get('/new', controller.getNewProducts);
// GET /api/products/bestseller: Lấy danh sách sản phẩm bán chạy
router.get('/bestseller', controller.getBestsellerProducts);

// Routes chính cho products
// GET /api/products: Lấy danh sách tất cả sản phẩm (có thể filter, search, pagination)
// controller.listProducts sẽ xử lý logic lấy danh sách
router.get('/', controller.listProducts);

// GET /api/products/:id: Lấy chi tiết một sản phẩm theo ID
// :id là route parameter, ví dụ: /api/products/1 → req.params.id = '1'
router.get('/:id', controller.getProduct);

// POST /api/products: Tạo sản phẩm mới (CHỈ ADMIN)
// authenticate: Phải đăng nhập
// authorizeAdmin: Phải là admin
// controller.createProduct: Hàm xử lý tạo sản phẩm mới
router.post('/', authenticate, authorizeAdmin, controller.createProduct);

// PUT /api/products/:id: Cập nhật thông tin sản phẩm (CHỈ ADMIN)
// :id là ID của sản phẩm cần cập nhật
router.put('/:id', authenticate, authorizeAdmin, controller.updateProduct);

// DELETE /api/products/:id: Xóa sản phẩm (CHỈ ADMIN)
// :id là ID của sản phẩm cần xóa
router.delete('/:id', authenticate, authorizeAdmin, controller.deleteProduct);

// Export router để file routes/index.js có thể sử dụng
module.exports = router;


















