# Hướng dẫn chạy dự án nhanh

## Bước 1: Cài đặt dependencies
```bash
npm install
```

## Bước 2: Tạo file .env
Tạo file `.env` trong thư mục `ecommerce-nodejs` với nội dung:

```
DB_NAME=web_mobile
DB_USER=root
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=3306
PORT=3000
SEED_ADMIN_PASSWORD=Admin@123
SEED_USER_PASSWORD=User@123
```

**Lưu ý:** Nếu dùng XAMPP, để `DB_PASSWORD` trống. Nếu dùng MySQL riêng, điền password của bạn.

## Bước 3: Tạo database
Mở MySQL/phpMyAdmin và tạo database:
```sql
CREATE DATABASE web_mobile;
```

## Bước 4: Chạy seed data
```bash
node src/seed/seed.js
```

## Bước 5: Khởi động server
```bash
npm start
```

## Bước 6: Mở trình duyệt
Truy cập: http://localhost:3000

---

**Tài khoản mặc định:**
- Admin: admin@example.com / Admin@123
- User: user@example.com / User@123

