-- =====================================================
-- WEB MOBILE E-COMMERCE DATABASE
-- File SQL để tạo database, bảng và dữ liệu mẫu
-- Chạy file này trong phpMyAdmin hoặc MySQL client
-- =====================================================

-- Tạo database (nếu chưa có)
CREATE DATABASE IF NOT EXISTS `web_mobile` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `web_mobile`;

-- =====================================================
-- XÓA CÁC BẢNG CŨ (NẾU CÓ) - CHẠY NẾU MUỐN RESET
-- =====================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `order_details`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `orders`;
DROP TABLE IF EXISTS `products`;
DROP TABLE IF EXISTS `categories`;
DROP TABLE IF EXISTS `banners`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- TẠO CÁC BẢNG
-- =====================================================

-- Bảng users (Người dùng)
CREATE TABLE `users` (
  `user_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `address` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  `favourite_product` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng categories (Danh mục sản phẩm)
CREATE TABLE `categories` (
  `category_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng products (Sản phẩm)
CREATE TABLE `products` (
  `product_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `sale_price` DECIMAL(12,2) DEFAULT NULL,
  `stock` INT UNSIGNED DEFAULT 0,
  `brand` VARCHAR(100) DEFAULT NULL,
  `ram` VARCHAR(20) DEFAULT NULL,
  `storage` VARCHAR(50) DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `category_id` INT UNSIGNED DEFAULT NULL,
  `is_promotion` TINYINT(1) DEFAULT 0,
  `is_new` TINYINT(1) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`product_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng orders (Đơn hàng)
CREATE TABLE `orders` (
  `order_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NOT NULL,
  `total_price` DECIMAL(12,2) NOT NULL,
  `payment_method` ENUM('COD', 'ONLINE') NOT NULL,
  `status` ENUM('pending', 'shipped', 'done', 'cancel') DEFAULT 'pending',
  PRIMARY KEY (`order_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng order_details (Chi tiết đơn hàng)
CREATE TABLE `order_details` (
  `order_detail_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_id` INT UNSIGNED NOT NULL,
  `product_id` INT UNSIGNED NOT NULL,
  `quantity` INT UNSIGNED NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  PRIMARY KEY (`order_detail_id`),
  KEY `order_id` (`order_id`),
  KEY `product_id` (`product_id`),
  CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`order_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng reviews (Đánh giá sản phẩm)
CREATE TABLE `reviews` (
  `review_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `product_id` INT UNSIGNED NOT NULL,
  `user_id` INT UNSIGNED NOT NULL,
  `rating` INT UNSIGNED NOT NULL,
  `comment` TEXT DEFAULT NULL,
  PRIMARY KEY (`review_id`),
  KEY `product_id` (`product_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`product_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng banners (Banner quảng cáo)
CREATE TABLE `banners` (
  `banner_id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) DEFAULT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `link` VARCHAR(255) DEFAULT NULL,
  PRIMARY KEY (`banner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- CHÈN DỮ LIỆU MẪU
-- =====================================================

-- Chèn Users (Mật khẩu đã được hash bằng bcrypt)
-- Admin: admin@example.com / Admin@123
-- User: user@example.com / User@123
INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Admin', 'admin@example.com', '$2b$10$MAFa4Cl9tN/6FJUcL8qAMedIAGWeVNFxcK49uku0HTT1G7bGInGAK', 'admin'),
(2, 'User', 'user@example.com', '$2b$10$moxJGjlrymbiaHl1Wik2Q.JQv52zTXXKTel3nmxr/hbdCK83OtSMi', 'user');

-- Chèn Categories
INSERT INTO `categories` (`category_id`, `name`, `description`) VALUES
(1, 'Điện thoại', 'Smartphones'),
(2, 'Tablet', 'Tablets'),
(3, 'Phụ kiện', 'Accessories');

-- Chèn Products (với đường dẫn ảnh)
-- Điện thoại (Smart_phones)
INSERT INTO `products` (`product_id`, `name`, `description`, `price`, `stock`, `brand`, `ram`, `storage`, `image_url`, `category_id`, `is_promotion`, `is_new`) VALUES
-- iPhone
(1, 'iPhone 15 128GB', 'iPhone 15, màn hình Super Retina XDR, chip A16 Bionic', 21990000.00, 50, 'Apple', '6GB', '128GB', 'uploads/products/Smart_phones/iphone/iphone_1.webp', 1, 0, 1),
(2, 'iPhone 15 Pro 256GB', 'iPhone 15 Pro với chip A17 Pro, camera 48MP', 28990000.00, 40, 'Apple', '8GB', '256GB', 'uploads/products/Smart_phones/iphone/iphone_2.webp', 1, 1, 1),
(3, 'iPhone 14 128GB', 'iPhone 14 với chip A15 Bionic, camera kép', 18990000.00, 60, 'Apple', '6GB', '128GB', 'uploads/products/Smart_phones/iphone/iphone_3.webp', 1, 0, 0),
(4, 'iPhone 13 256GB', 'iPhone 13 với chip A15, pin lâu', 15990000.00, 45, 'Apple', '4GB', '256GB', 'uploads/products/Smart_phones/iphone/iphone_4.webp', 1, 1, 0),
(5, 'iPhone 12 128GB', 'iPhone 12 với màn hình OLED, 5G', 12990000.00, 35, 'Apple', '4GB', '128GB', 'uploads/products/Smart_phones/iphone/iphone_5.webp', 1, 0, 0),
(6, 'iPhone 15 Plus 256GB', 'iPhone 15 Plus màn hình lớn 6.7 inch', 24990000.00, 30, 'Apple', '6GB', '256GB', 'uploads/products/Smart_phones/iphone/iphone_6.webp', 1, 0, 1),
(7, 'iPhone 14 Pro Max 512GB', 'iPhone 14 Pro Max với Dynamic Island', 32990000.00, 25, 'Apple', '6GB', '512GB', 'uploads/products/Smart_phones/iphone/iphone_7.webp', 1, 1, 0),
(8, 'iPhone SE 2022 128GB', 'iPhone SE giá rẻ với chip A15', 9990000.00, 55, 'Apple', '4GB', '128GB', 'uploads/products/Smart_phones/iphone/iphone_8.webp', 1, 0, 0),
(9, 'iPhone 11 128GB', 'iPhone 11 với camera kép, pin tốt', 8990000.00, 40, 'Apple', '4GB', '128GB', 'uploads/products/Smart_phones/iphone/iphone_9.webp', 1, 1, 0),
(10, 'iPhone 15 Pro Max 1TB', 'iPhone 15 Pro Max phiên bản cao cấp nhất', 39990000.00, 20, 'Apple', '8GB', '1TB', 'uploads/products/Smart_phones/iphone/iphone_10.webp', 1, 0, 1),
(11, 'iPhone 14 Plus 256GB', 'iPhone 14 Plus màn hình lớn, pin lâu', 22990000.00, 30, 'Apple', '6GB', '256GB', 'uploads/products/Smart_phones/iphone/iphone_11.webp', 1, 0, 0),
-- Samsung
(12, 'Samsung Galaxy S24 256GB', 'Galaxy S24 với màn hình Dynamic AMOLED 2X', 18990000.00, 70, 'Samsung', '8GB', '256GB', 'uploads/products/Smart_phones/samsung/samsung_1.webp', 1, 1, 1),
(13, 'Samsung Galaxy S23 Ultra 512GB', 'Galaxy S23 Ultra với bút S Pen, camera 200MP', 24990000.00, 50, 'Samsung', '12GB', '512GB', 'uploads/products/Smart_phones/samsung/samsung_2.webp', 1, 0, 0),
(14, 'Samsung Galaxy S22 128GB', 'Galaxy S22 với chip Snapdragon 8 Gen 1', 14990000.00, 60, 'Samsung', '8GB', '128GB', 'uploads/products/Smart_phones/samsung/samsung_3.webp', 1, 1, 0),
(15, 'Samsung Galaxy A54 128GB', 'Galaxy A54 giá rẻ, camera tốt', 7990000.00, 80, 'Samsung', '6GB', '128GB', 'uploads/products/Smart_phones/samsung/samsung_4.webp', 1, 0, 0),
(16, 'Samsung Galaxy Note 20 Ultra', 'Galaxy Note 20 Ultra với bút S Pen', 19990000.00, 35, 'Samsung', '12GB', '256GB', 'uploads/products/Smart_phones/samsung/samsung_5.webp', 1, 1, 0),
(17, 'Samsung Galaxy Z Fold 5', 'Galaxy Z Fold 5 màn hình gập', 39990000.00, 15, 'Samsung', '12GB', '512GB', 'uploads/products/Smart_phones/samsung/samsung_6.webp', 1, 0, 1),
(18, 'Samsung Galaxy A34 128GB', 'Galaxy A34 giá rẻ, pin lâu', 6990000.00, 90, 'Samsung', '6GB', '128GB', 'uploads/products/Smart_phones/samsung/samsung_7.webp', 1, 0, 0),
(19, 'Samsung Galaxy S21 FE', 'Galaxy S21 FE với màn hình 120Hz', 11990000.00, 45, 'Samsung', '8GB', '256GB', 'uploads/products/Smart_phones/samsung/samsung_8.webp', 1, 1, 0),
-- Oppo
(20, 'Oppo Find X5 Pro', 'Oppo Find X5 Pro với camera Hasselblad', 17990000.00, 40, 'Oppo', '12GB', '256GB', 'uploads/products/Smart_phones/oppo/oppo_1.webp', 1, 0, 1),
(21, 'Oppo Reno 10 Pro', 'Oppo Reno 10 Pro với camera 50MP', 12990000.00, 55, 'Oppo', '8GB', '256GB', 'uploads/products/Smart_phones/oppo/oppo_2.webp', 1, 1, 0),
(22, 'Oppo A78 128GB', 'Oppo A78 giá rẻ, pin 5000mAh', 5990000.00, 70, 'Oppo', '8GB', '128GB', 'uploads/products/Smart_phones/oppo/oppo_3.webp', 1, 0, 0),
(23, 'Oppo Find N2 Flip', 'Oppo Find N2 Flip màn hình gập', 19990000.00, 25, 'Oppo', '8GB', '256GB', 'uploads/products/Smart_phones/oppo/oppo_4.webp', 1, 0, 1),
(24, 'Oppo Reno 8 Pro', 'Oppo Reno 8 Pro với chip MediaTek', 10990000.00, 50, 'Oppo', '8GB', '256GB', 'uploads/products/Smart_phones/oppo/oppo_5.webp', 1, 1, 0),
(25, 'Oppo A58 128GB', 'Oppo A58 giá rẻ, màn hình lớn', 4990000.00, 85, 'Oppo', '6GB', '128GB', 'uploads/products/Smart_phones/oppo/oppo_6.webp', 1, 0, 0),
(26, 'Oppo Find X3 Pro', 'Oppo Find X3 Pro với màn hình 120Hz', 16990000.00, 30, 'Oppo', '12GB', '256GB', 'uploads/products/Smart_phones/oppo/oppo_7.webp', 1, 0, 0),
(27, 'Oppo Reno 9 Pro', 'Oppo Reno 9 Pro với camera selfie tốt', 11990000.00, 45, 'Oppo', '8GB', '256GB', 'uploads/products/Smart_phones/oppo/oppo_8.webp', 1, 1, 0),
(28, 'Oppo A17 64GB', 'Oppo A17 giá rẻ nhất', 3990000.00, 100, 'Oppo', '4GB', '64GB', 'uploads/products/Smart_phones/oppo/oppo_9.webp', 1, 0, 0),
(29, 'Oppo Find X6 Pro', 'Oppo Find X6 Pro flagship mới nhất', 21990000.00, 20, 'Oppo', '16GB', '512GB', 'uploads/products/Smart_phones/oppo/oppo_10.webp', 1, 0, 1),
-- Tablet (Laptops)
(30, 'iPad Air M2 10.9-inch Wi‑Fi 128GB', 'iPad Air M2 hiệu năng cao, màn 10.9-inch', 15990000.00, 30, 'Apple', '8GB', '128GB', 'uploads/products/Laptops/macbook/mac_1.webp', 2, 0, 1),
(31, 'MacBook Pro 14 inch M3', 'MacBook Pro 14 inch với chip M3', 45990000.00, 25, 'Apple', '18GB', '512GB', 'uploads/products/Laptops/macbook/mac_2.webp', 2, 0, 1),
(32, 'MacBook Air M2 13 inch', 'MacBook Air M2 siêu mỏng nhẹ', 29990000.00, 40, 'Apple', '8GB', '256GB', 'uploads/products/Laptops/macbook/mac_3.webp', 2, 1, 0),
(33, 'MacBook Pro 16 inch M3 Max', 'MacBook Pro 16 inch hiệu năng cực mạnh', 69990000.00, 15, 'Apple', '36GB', '1TB', 'uploads/products/Laptops/macbook/mac_4.webp', 2, 0, 1),
(34, 'iPad Pro 12.9 inch M2', 'iPad Pro 12.9 inch với chip M2', 24990000.00, 20, 'Apple', '8GB', '256GB', 'uploads/products/Laptops/macbook/mac_5.webp', 2, 0, 1),
-- Asus Laptops
(35, 'Asus ROG Strix G16', 'Asus ROG gaming laptop RTX 4060', 32990000.00, 30, 'Asus', '16GB', '512GB', 'uploads/products/Laptops/asus/asus_1.webp', 2, 0, 1),
(36, 'Asus ZenBook 14 OLED', 'Asus ZenBook màn hình OLED đẹp', 22990000.00, 35, 'Asus', '16GB', '512GB', 'uploads/products/Laptops/asus/asus_2.webp', 2, 1, 0),
(37, 'Asus TUF Gaming A15', 'Asus TUF gaming laptop bền bỉ', 19990000.00, 40, 'Asus', '16GB', '512GB', 'uploads/products/Laptops/asus/asus_3.webp', 2, 0, 0),
(38, 'Asus Vivobook 15', 'Asus Vivobook giá rẻ, học tập', 12990000.00, 50, 'Asus', '8GB', '256GB', 'uploads/products/Laptops/asus/asus_4.webp', 2, 1, 0),
(39, 'Asus ROG Zephyrus G14', 'Asus ROG Zephyrus gaming mỏng nhẹ', 35990000.00, 20, 'Asus', '16GB', '1TB', 'uploads/products/Laptops/asus/asus_5.webp', 2, 0, 1),
-- Dell Laptops
(40, 'Dell XPS 13 Plus', 'Dell XPS 13 Plus cao cấp', 34990000.00, 25, 'Dell', '16GB', '512GB', 'uploads/products/Laptops/dell/dell_1.webp', 2, 0, 1),
(41, 'Dell Inspiron 15', 'Dell Inspiron 15 giá rẻ', 14990000.00, 45, 'Dell', '8GB', '256GB', 'uploads/products/Laptops/dell/dell_2.webp', 2, 1, 0),
(42, 'Dell Alienware m16', 'Dell Alienware gaming laptop', 49990000.00, 15, 'Dell', '32GB', '1TB', 'uploads/products/Laptops/dell/dell_3.webp', 2, 0, 1),
(43, 'Dell Latitude 5430', 'Dell Latitude doanh nhân', 21990000.00, 30, 'Dell', '16GB', '512GB', 'uploads/products/Laptops/dell/dell_4.webp', 2, 0, 0),
(44, 'Dell G15 Gaming', 'Dell G15 gaming laptop', 18990000.00, 35, 'Dell', '16GB', '512GB', 'uploads/products/Laptops/dell/dell_5.webp', 2, 1, 0),
-- Lenovo Laptops
(45, 'Lenovo ThinkPad X1 Carbon', 'Lenovo ThinkPad doanh nhân', 32990000.00, 25, 'Lenovo', '16GB', '512GB', 'uploads/products/Laptops/lenovo/lenovo_1.webp', 2, 0, 1),
(46, 'Lenovo Legion 5 Pro', 'Lenovo Legion gaming laptop', 27990000.00, 30, 'Lenovo', '16GB', '512GB', 'uploads/products/Laptops/lenovo/lenovo_2.webp', 2, 1, 0),
(47, 'Lenovo IdeaPad 3', 'Lenovo IdeaPad giá rẻ', 11990000.00, 50, 'Lenovo', '8GB', '256GB', 'uploads/products/Laptops/lenovo/lenovo_3.webp', 2, 0, 0),
(48, 'Lenovo Yoga 9i', 'Lenovo Yoga 2-in-1', 29990000.00, 20, 'Lenovo', '16GB', '512GB', 'uploads/products/Laptops/lenovo/lenovo_4.webp', 2, 0, 1),
(49, 'Lenovo ThinkBook 14', 'Lenovo ThinkBook văn phòng', 17990000.00, 40, 'Lenovo', '16GB', '512GB', 'uploads/products/Laptops/lenovo/lenovo_5.webp', 2, 1, 0),
-- Tablet (Tables)
(50, 'Xiaomi Pad 6 8GB/256GB', 'Xiaomi Pad 6 màn 11-inch 144Hz', 8990000.00, 40, 'Xiaomi', '8GB', '256GB', 'uploads/products/Tables/pc_1.webp', 2, 0, 0),
(51, 'Samsung Galaxy Tab S9', 'Samsung Galaxy Tab S9 màn hình AMOLED', 14990000.00, 30, 'Samsung', '8GB', '128GB', 'uploads/products/Tables/pc_2.webp', 2, 1, 1),
(52, 'iPad 10.2 inch 2022', 'iPad 10.2 inch giá rẻ', 8990000.00, 50, 'Apple', '3GB', '64GB', 'uploads/products/Tables/pc_3.webp', 2, 0, 0),
(53, 'Huawei MatePad Pro', 'Huawei MatePad Pro màn hình lớn', 12990000.00, 25, 'Huawei', '8GB', '256GB', 'uploads/products/Tables/pc_4.webp', 2, 0, 0),
(54, 'Realme Pad 2', 'Realme Pad 2 giá rẻ', 5990000.00, 60, 'Realme', '6GB', '128GB', 'uploads/products/Tables/pc_5.webp', 2, 1, 0),
(55, 'Lenovo Tab P11 Pro', 'Lenovo Tab P11 Pro OLED', 10990000.00, 35, 'Lenovo', '6GB', '128GB', 'uploads/products/Tables/pc_6.webp', 2, 0, 0),
(56, 'OnePlus Pad', 'OnePlus Pad hiệu năng cao', 11990000.00, 30, 'OnePlus', '8GB', '128GB', 'uploads/products/Tables/pc_7.webp', 2, 0, 1),
(57, 'Vivo Pad Air', 'Vivo Pad Air màn hình lớn', 7990000.00, 40, 'Vivo', '8GB', '256GB', 'uploads/products/Tables/pc_8.webp', 2, 1, 0),
-- Phụ kiện (Accessories)
(58, 'Tai nghe Bluetooth AirPods Pro 2', 'Chống ồn chủ động, sạc MagSafe', 5490000.00, 100, 'Apple', '-', '-', 'uploads/products/Accessories/ariport/blu_1.webp', 3, 1, 0),
(59, 'AirPods Max', 'Tai nghe over-ear cao cấp', 12990000.00, 50, 'Apple', '-', '-', 'uploads/products/Accessories/ariport/blu_2.webp', 3, 0, 1),
(60, 'AirPods 3', 'Tai nghe không dây thế hệ 3', 4990000.00, 80, 'Apple', '-', '-', 'uploads/products/Accessories/ariport/blu_3.webp', 3, 1, 0),
(61, 'Sony WH-1000XM5', 'Tai nghe chống ồn tốt nhất', 8990000.00, 60, 'Sony', '-', '-', 'uploads/products/Accessories/ariport/blu_4.webp', 3, 0, 0),
(62, 'Samsung Galaxy Buds2 Pro', 'Tai nghe Samsung cao cấp', 3990000.00, 70, 'Samsung', '-', '-', 'uploads/products/Accessories/ariport/blu_5.webp', 3, 1, 0),
(63, 'Sạc nhanh Samsung 25W USB-C', 'Sạc nhanh 25W chính hãng Samsung', 390000.00, 200, 'Samsung', '-', '-', 'uploads/products/Accessories/voice/voice_1.webp', 3, 0, 0),
(64, 'Sạc không dây MagSafe', 'Sạc không dây cho iPhone', 1990000.00, 150, 'Apple', '-', '-', 'uploads/products/Accessories/voice/voice_2.webp', 3, 1, 0);

-- Chèn Orders (Đơn hàng mẫu)
INSERT INTO `orders` (`order_id`, `user_id`, `total_price`, `payment_method`, `status`) VALUES
(1, 2, 21990000.00, 'COD', 'done'),
(2, 2, 18990000.00, 'ONLINE', 'shipped'),
(3, 2, 5490000.00, 'COD', 'pending');

-- Chèn Order Details (Chi tiết đơn hàng)
INSERT INTO `order_details` (`order_detail_id`, `order_id`, `product_id`, `quantity`, `price`) VALUES
(1, 1, 1, 1, 21990000.00),
(2, 2, 2, 1, 18990000.00),
(3, 3, 58, 1, 5490000.00);

-- Chèn Reviews (Đánh giá sản phẩm)
INSERT INTO `reviews` (`review_id`, `product_id`, `user_id`, `rating`, `comment`) VALUES
(1, 1, 2, 5, 'Sản phẩm tuyệt vời, màn hình đẹp, hiệu năng mạnh mẽ!'),
(2, 2, 2, 4, 'Điện thoại tốt, camera chụp đẹp, pin lâu.'),
(3, 58, 2, 5, 'Tai nghe chất lượng cao, chống ồn tốt.'),
(4, 12, 2, 5, 'Samsung S24 rất đáng mua, màn hình sắc nét.'),
(5, 30, 2, 4, 'iPad Air M2 mượt mà, phù hợp cho công việc.');

-- Chèn Banners
INSERT INTO `banners` (`banner_id`, `title`, `image_url`, `link`) VALUES
(1, 'Giảm giá cuối tuần', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1600&auto=format&fit=crop', '#'),
(2, 'Deal hot điện thoại', 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1600&auto=format&fit=crop', '#'),
(3, 'Laptop mới về', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=1600&auto=format&fit=crop', '#'),
(4, 'Phụ kiện giảm sốc', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1600&auto=format&fit=crop', '#');

-- =====================================================
-- HOÀN TẤT
-- =====================================================
SELECT 'Database và dữ liệu mẫu đã được tạo thành công!' AS 'Status';

