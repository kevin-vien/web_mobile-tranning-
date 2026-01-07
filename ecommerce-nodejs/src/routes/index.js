// Import thư viện Express để tạo router
const express = require('express');

// Import các route modules từ các file tương ứng
// Mỗi file route chứa các endpoint cho một resource cụ thể
const authRoutes = require('./auth.routes');        // Routes cho authentication (login, register, logout)
const productRoutes = require('./products.routes'); // Routes cho products (CRUD sản phẩm)
const categoryRoutes = require('./categories.routes'); // Routes cho categories (danh mục sản phẩm)
const orderRoutes = require('./orders.routes');     // Routes cho orders (đơn hàng)
const reviewRoutes = require('./reviews.routes');   // Routes cho reviews (đánh giá sản phẩm)
const bannerRoutes = require('./banners.routes');   // Routes cho banners (banner quảng cáo)

// Tạo Express Router instance
// Router cho phép nhóm các routes lại với nhau
const router = express.Router();

// Mount các route modules vào các đường dẫn tương ứng
// Khi truy cập /api/auth/... sẽ được xử lý bởi authRoutes
// Khi truy cập /api/products/... sẽ được xử lý bởi productRoutes
// Tương tự cho các routes khác
router.use('/auth', authRoutes);        // /api/auth/...
router.use('/products', productRoutes); // /api/products/...
router.use('/categories', categoryRoutes); // /api/categories/...
router.use('/orders', orderRoutes);    // /api/orders/...
router.use('/reviews', reviewRoutes);  // /api/reviews/...
router.use('/banners', bannerRoutes);  // /api/banners/...

// Export router để file app.js có thể sử dụng
// app.js sẽ mount router này vào /api
module.exports = router;


