# Web Mobile E-commerce Project

Dự án thương mại điện tử bán điện thoại, laptop và phụ kiện.

## Yêu cầu hệ thống

- Node.js (phiên bản 14 trở lên)
- MySQL/MariaDB (XAMPP hoặc MySQL Server)
- npm hoặc yarn

## Cài đặt và chạy dự án

### Bước 1: Cài đặt dependencies

Mở terminal/command prompt và di chuyển vào thư mục `ecommerce-nodejs`:

```bash
cd ecommerce-nodejs
npm install
```

### Bước 2: Cấu hình Database

1. Tạo file `.env` trong thư mục `ecommerce-nodejs` với nội dung:

```env
# Database Configuration
DB_NAME=web_mobile
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306

# Server Configuration
PORT=3000

# Seed Data (optional)
SEED_ADMIN_PASSWORD=Admin@123
SEED_USER_PASSWORD=User@123
```

**Lưu ý:**
- Nếu bạn dùng XAMPP, thường `DB_PASSWORD` để trống
- Nếu bạn dùng MySQL riêng, điền password của bạn vào `DB_PASSWORD`
- Đảm bảo MySQL/MariaDB đang chạy

2. Tạo database trong MySQL:

```sql
CREATE DATABASE IF NOT EXISTS web_mobile;
```

Hoặc mở phpMyAdmin (nếu dùng XAMPP) và tạo database tên `web_mobile`.

### Bước 3: Tạo Database và Dữ liệu mẫu

**Cách 1: Sử dụng file SQL (Khuyến nghị cho phpMyAdmin)**

1. Mở phpMyAdmin (http://localhost/phpmyadmin)
2. Click tab **"Import"**
3. Chọn file `ecommerce-nodejs/database.sql`
4. Click **"Go"**

File SQL sẽ tự động:
- Tạo database `web_mobile`
- Tạo tất cả các bảng
- Chèn dữ liệu mẫu

**Cách 2: Sử dụng Node.js script**

Chạy script seed để tạo dữ liệu mẫu:

```bash
node src/seed/seed.js
```

Bạn sẽ thấy thông báo: `Seed data inserted successfully.`

**Tài khoản mặc định sau khi seed:**
- Admin: `admin@example.com` / `Admin@123`
- User: `user@example.com` / `User@123`

### Bước 4: Khởi động Server

Chạy server:

```bash
npm start
```

Hoặc:

```bash
node src/server.js
```

Bạn sẽ thấy thông báo:
```
Database connection has been established successfully.
Server is running on port 3000
```

### Bước 5: Truy cập ứng dụng

Mở trình duyệt và truy cập:
- **Frontend:** http://localhost:3000
- **API Base:** http://localhost:3000/api

## Cấu trúc dự án

```
web_mobile-tranning-
├── ecommerce-nodejs/          # Backend (Node.js + Express + Sequelize)
│   ├── src/
│   │   ├── config/            # Cấu hình database
│   │   ├── controllers/       # Logic xử lý request
│   │   ├── models/            # Định nghĩa database models
│   │   ├── routes/            # Định nghĩa API routes
│   │   ├── middleware/        # Authentication, validation
│   │   ├── seed/              # Script tạo dữ liệu mẫu
│   │   ├── app.js             # Cấu hình Express app
│   │   └── server.js          # Khởi động server
│   ├── public/                # Static files (images)
│   └── package.json
└── frontend-html/             # Frontend (HTML + jQuery + Bootstrap)
    ├── index.html             # Trang chủ
    ├── login.html             # Đăng nhập
    ├── register.html          # Đăng ký
    ├── product_detail.html    # Chi tiết sản phẩm
    └── checkout.html          # Thanh toán
```

## API Endpoints

### Products
- `GET /api/products` - Lấy danh sách sản phẩm
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `GET /api/products/promotion` - Sản phẩm khuyến mãi
- `GET /api/products/new` - Sản phẩm mới
- `GET /api/products/bestseller` - Sản phẩm bán chạy

### Categories
- `GET /api/categories` - Lấy danh sách danh mục

### Auth
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `POST /api/auth/logout` - Đăng xuất

### Banners
- `GET /api/banners` - Lấy danh sách banner

## Xử lý lỗi thường gặp

### Lỗi: "Unable to connect to the database"
- Kiểm tra MySQL/MariaDB có đang chạy không
- Kiểm tra thông tin trong file `.env` có đúng không
- Kiểm tra database `web_mobile` đã được tạo chưa

### Lỗi: "Port 3000 is already in use"
- Đổi PORT trong file `.env` sang port khác (ví dụ: 3001)
- Hoặc tắt ứng dụng đang dùng port 3000

### Dữ liệu không hiển thị
- Kiểm tra Console trong trình duyệt (F12) để xem lỗi
- Đảm bảo server đang chạy
- Kiểm tra API có trả về dữ liệu: http://localhost:3000/api/products
- Chạy lại seed data nếu cần: `node src/seed/seed.js`

## Scripts có sẵn

- `npm start` - Khởi động server
- `npm run dev` - Khởi động server (alias của start)
- `npm run update-api` - Cập nhật API base URL trong frontend

## Phát triển thêm

Để import thêm sản phẩm từ thư mục images:

```bash
node src/seed/import-products-from-images.js
```

## Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Console log trong terminal khi chạy server
2. Console trong trình duyệt (F12)
3. Network tab trong DevTools để xem API requests
