// const jwt = require('jsonwebtoken');

// function authenticate(req, res, next) {
//   const authHeader = req.headers.authorization || '';
//   const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
//   if (!token) return res.status(401).json({ message: 'Unauthorized' });
//   try {
//     const secret = process.env.JWT_SECRET || 'dev_secret_change_me';
//     const decoded = jwt.verify(token, secret);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// }

// function authorizeAdmin(req, res, next) {
//   if (req.user && req.user.role === 'admin') return next();
//   return res.status(403).json({ message: 'Forbidden' });
// }

// module.exports = { authenticate, authorizeAdmin };
// Import thư viện jsonwebtoken để làm việc với JWT (tạo, xác minh token)
const jwt = require("jsonwebtoken");

// Middleware xác thực người dùng qua token
function authenticate(req, res, next) {
  // Lấy giá trị của header 'Authorization' từ request (nếu không có thì gán rỗng)
  const authHeader = req.headers.authorization || "";

  // Kiểm tra xem header có bắt đầu bằng "Bearer " hay không
  // Nếu có → lấy chuỗi token phía sau "Bearer "
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  // Nếu không có token → từ chối truy cập (HTTP 401 Unauthorized)
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    // Lấy khóa bí mật để xác minh token (ưu tiên lấy từ biến môi trường, nếu không có thì dùng chuỗi mặc định)
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";

    // Giải mã (verify) token để lấy dữ liệu bên trong (payload)
    // Nếu token sai hoặc hết hạn → lỗi sẽ nhảy xuống catch
    const decoded = jwt.verify(token, secret);

    // Lưu thông tin người dùng đã được giải mã vào req.user
    // Nhờ vậy các middleware hoặc route sau có thể truy cập req.user
    req.user = decoded;

    // Gọi next() để chuyển sang middleware hoặc route tiếp theo
    next();
  } catch (err) {
    // Nếu token không hợp lệ hoặc hết hạn → trả lỗi 401
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Middleware kiểm tra quyền admin
function authorizeAdmin(req, res, next) {
  // Kiểm tra nếu đã có thông tin người dùng và quyền là 'admin'
  if (req.user && req.user.role === "admin") return next();

  // Nếu không phải admin → từ chối truy cập (HTTP 403 Forbidden)
  return res.status(403).json({ message: "Forbidden" });
}

// Xuất 2 middleware ra để có thể import và sử dụng ở nơi khác
module.exports = { authenticate, authorizeAdmin };
