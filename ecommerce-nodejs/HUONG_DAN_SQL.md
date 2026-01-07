# Hướng dẫn chạy SQL trong phpMyAdmin

## Cách 1: Import file SQL (Khuyến nghị)

1. Mở **phpMyAdmin** (thường là: http://localhost/phpmyadmin)
2. Chọn database `web_mobile` (hoặc tạo mới nếu chưa có)
3. Click tab **"Import"** ở menu trên
4. Click **"Choose File"** và chọn file `database.sql`
5. Click **"Go"** để chạy
6. Đợi đến khi thấy thông báo thành công

## Cách 2: Copy & Paste SQL

1. Mở **phpMyAdmin**
2. Chọn database `web_mobile` (hoặc tạo mới)
3. Click tab **"SQL"** ở menu trên
4. Mở file `database.sql` bằng Notepad hoặc editor
5. Copy toàn bộ nội dung và paste vào ô SQL
6. Click **"Go"** để chạy

## Lưu ý

- File SQL sẽ tự động tạo database `web_mobile` nếu chưa có
- Nếu database đã có dữ liệu, file SQL sẽ xóa các bảng cũ trước khi tạo mới
- Sau khi chạy xong, bạn sẽ có:
  - 2 tài khoản: Admin và User
  - 3 danh mục: Điện thoại, Tablet, Phụ kiện
  - 6 sản phẩm mẫu
  - 2 banner

## Tài khoản mặc định

- **Admin:** admin@example.com / Admin@123
- **User:** user@example.com / User@123

## Kiểm tra kết quả

Sau khi chạy SQL, kiểm tra:
- Có 7 bảng được tạo: users, categories, products, orders, order_details, reviews, banners
- Có dữ liệu trong các bảng users, categories, products, banners

