	// Import thư viện Express - framework web cho Node.js
	// Express giúp tạo server HTTP và xử lý các route, middleware
	const express = require('express');
	
	// Import thư viện CORS (Cross-Origin Resource Sharing)
	// CORS cho phép frontend từ domain khác gọi API đến server này
	const cors = require('cors');
	
	// Import module path của Node.js
	// Dùng để xử lý đường dẫn file/folder một cách an toàn trên mọi hệ điều hành
	const path = require('path');
	
	// Import hàm testConnection từ file database.js
	// Hàm này dùng để kiểm tra kết nối đến MySQL database
	const { testConnection } = require('./config/database');
	
	// Import hàm syncDatabase từ file sync.js
	// Hàm này dùng để đồng bộ cấu trúc database với các model đã định nghĩa
	const { syncDatabase } = require('./loaders/sync');
	
	// Import tất cả các API routes từ thư mục routes
	// File index.js trong routes sẽ tổng hợp tất cả các route (products, orders, auth, v.v.)
	const apiRoutes = require('./routes');

	// Tạo instance Express application
	// Đây là object chính để cấu hình server và xử lý HTTP requests
	const app = express();

	// Middleware: Bật CORS cho tất cả các route
	// Cho phép frontend từ bất kỳ domain nào gọi API (trong development)
	app.use(cors());
	
	// Middleware: Parse JSON body từ HTTP requests
	// Tự động chuyển đổi JSON string trong request body thành JavaScript object
	// Ví dụ: req.body sẽ là object thay vì string
	app.use(express.json());

	// Middleware: Serve static files (ảnh, CSS, JS) từ thư mục public
	// Khi truy cập /static/... sẽ trỏ đến thư mục public/...
	// Ví dụ: /static/uploads/products/iphone_1.webp → public/uploads/products/iphone_1.webp
	// path.join(__dirname, '..', 'public') = đường dẫn tuyệt đối đến thư mục public
	app.use('/static', express.static(path.join(__dirname, '..', 'public')));

	// Đường dẫn đến thư mục frontend-html (chứa các file HTML)
	// __dirname = thư mục hiện tại (src/)
	// '..' = lên 1 cấp (ecommerce-nodejs/)
	// '..' = lên 1 cấp nữa (ngonngukichban-main/)
	// 'frontend-html' = vào thư mục frontend-html
	const frontendDir = path.join(__dirname, '..', '..', 'frontend-html');
	
	// Middleware: Serve static files từ thư mục frontend-html
	// Khi truy cập / sẽ tìm file tương ứng trong frontend-html
	// Ví dụ: /login.html → frontend-html/login.html
	app.use('/', express.static(frontendDir));
	
	// Route GET /: Khi truy cập trang chủ, trả về file index.html
	// req = request object (chứa thông tin từ client)
	// res = response object (dùng để gửi dữ liệu về client)
	app.get('/', (req, res) => {
		// Gửi file index.html về client
		// path.join() tạo đường dẫn đầy đủ đến file index.html
		res.sendFile(path.join(frontendDir, 'index.html'));
	});

	// Route GET /health: Endpoint kiểm tra server có đang chạy không
	// Thường dùng cho health check, monitoring, load balancer
	app.get('/health', (req, res) => {
		// Trả về JSON với status 'ok' để báo server đang hoạt động
		res.json({ status: 'ok' });
	});

	// Middleware: Mount tất cả API routes vào đường dẫn /api
	// Tất cả routes từ apiRoutes sẽ có prefix /api
	// Ví dụ: route /products → /api/products, route /orders → /api/orders
	app.use('/api', apiRoutes);

	// Khởi tạo database và kiểm tra kết nối khi server khởi động
	// Sử dụng IIFE (Immediately Invoked Function Expression) - hàm tự gọi ngay
	// async/await vì testConnection() và syncDatabase() là async functions
	// fire-and-forget: Chạy bất đồng bộ, không chờ kết quả, không làm crash server nếu lỗi
	(async () => {
		try {
			// Kiểm tra kết nối đến MySQL database
			// Nếu database chưa chạy hoặc thông tin sai → throw error
			await testConnection();
			
			// Đồng bộ cấu trúc database với các model
			// Tạo các bảng nếu chưa có, cập nhật cấu trúc nếu model thay đổi
			await syncDatabase();
		} catch (e) {
			// Nếu có lỗi (database không kết nối được, v.v.)
			// Chỉ in ra console, không làm crash server
			// Server vẫn chạy được nhưng database chưa sẵn sàng
			console.error('DB init failed:', e.message);
		}
	})();

	// Export app để file khác (server.js) có thể sử dụng
	// server.js sẽ import app và khởi động server HTTP
	module.exports = app;

