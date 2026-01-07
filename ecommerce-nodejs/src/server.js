// Import và cấu hình dotenv - thư viện đọc biến môi trường từ file .env
// File .env chứa các thông tin nhạy cảm: database password, API keys, v.v.
// .config() sẽ tự động load các biến từ file .env vào process.env
require('dotenv').config();

// Import Express app đã được cấu hình từ file app.js
// app chứa tất cả routes, middleware, và cấu hình của server
const app = require('./app');

// Lấy port từ biến môi trường PORT, nếu không có thì dùng port 3000 (mặc định)
// process.env.PORT: Biến môi trường PORT (có thể set trong .env hoặc khi chạy: PORT=8080 node server.js)
// || 3000: Nếu process.env.PORT là undefined/null/empty → dùng 3000
const PORT = process.env.PORT || 3000;

// Khởi động HTTP server, lắng nghe trên port đã định nghĩa
// app.listen() sẽ bind server vào port và bắt đầu nhận HTTP requests
// Callback function chạy khi server đã khởi động thành công
app.listen(PORT, () => {
  // In ra console thông báo server đã chạy và đang lắng nghe trên port nào
  // Template string `${PORT}` sẽ thay thế bằng giá trị PORT (ví dụ: 3000)
  console.log(`Server is running on port ${PORT}`);
});




