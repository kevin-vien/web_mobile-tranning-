-- Migration: Thêm trường is_new vào bảng products
-- Mục đích: Đánh dấu sản phẩm mới (1 = true, 0 = false)
-- 
-- LƯU Ý: MySQL không hỗ trợ IF NOT EXISTS cho ALTER TABLE ADD COLUMN
-- Nên chạy script add_is_new_column.js để an toàn hơn
-- Hoặc kiểm tra thủ công trước khi chạy câu lệnh này

-- Thêm cột is_new vào bảng products
ALTER TABLE `products` 
ADD COLUMN `is_new` TINYINT(1) NOT NULL DEFAULT 0 
COMMENT 'Sản phẩm mới (1 = true, 0 = false)' 
AFTER `is_promotion`;

-- Cập nhật một số sản phẩm mới làm ví dụ (tùy chọn)
-- UPDATE `products` SET `is_new` = 1 WHERE `product_id` IN (1, 2, 3);

