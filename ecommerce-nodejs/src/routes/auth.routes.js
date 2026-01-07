// Import thư viện Express để tạo router
const express = require("express");

// Import thư viện bcrypt để hash và so sánh mật khẩu
// bcrypt.hash(): Hash mật khẩu thành chuỗi không thể đảo ngược
// bcrypt.compare(): So sánh mật khẩu plain text với hash
const bcrypt = require("bcrypt");

// Import thư viện jsonwebtoken để tạo và xác minh JWT token
// jwt.sign(): Tạo token từ payload
// jwt.verify(): Xác minh và giải mã token
const jwt = require("jsonwebtoken");

// Import hàm defineModels để lấy các model
const { defineModels } = require("../models");

// Import middleware authenticate để kiểm tra user đã đăng nhập
const { authenticate } = require("../middleware/auth");

// Import các middleware validation để kiểm tra dữ liệu đầu vào
// validateRegister: Kiểm tra dữ liệu đăng ký (email, password, v.v.)
// validateLogin: Kiểm tra dữ liệu đăng nhập
// validateChangePassword: Kiểm tra dữ liệu đổi mật khẩu
// validateUpdateProfile: Kiểm tra dữ liệu cập nhật profile
const { 
  validateRegister, 
  validateLogin, 
  validateChangePassword,
  validateUpdateProfile 
} = require("../middleware/validation");

// Tạo Express Router instance cho auth routes
const router = express.Router();

// Gọi defineModels() để lấy model User
const { User } = defineModels();

// Route POST /api/auth/register: Đăng ký tài khoản mới
// validateRegister: Middleware kiểm tra dữ liệu đầu vào (email hợp lệ, password đủ mạnh, v.v.)
router.post("/register", validateRegister, async (req, res) => {
  try {
    // Lấy dữ liệu từ request body
    // Destructuring để lấy các trường: name, email, password, phone, address
    const { name, email, password, phone, address } = req.body;
    
    // Kiểm tra email đã tồn tại chưa
    // User.findOne({ where: { email } }): Tìm user có email này trong database
    const exists = await User.findOne({ where: { email } });
    
    // Nếu email đã tồn tại → trả lỗi 409 Conflict
    if (exists) {
      return res.status(409).json({
        message: "Validation failed",
        errors: [
          { field: "email", message: "Email đã được sử dụng", value: email }
        ]
      });
    }
    
    // Hash mật khẩu trước khi lưu vào database
    // bcrypt.hash(password, 10): Hash password với salt rounds = 10
    // Salt rounds càng cao → bảo mật càng tốt nhưng chậm hơn
    const hash = await bcrypt.hash(password, 10);
    
    // Tạo user mới trong database
    // User.create(): Tạo record mới trong bảng users
    // password: hash → lưu mật khẩu đã hash, không lưu plain text
    const user = await User.create({
      name,
      email,
      password: hash,  // Lưu mật khẩu đã hash
      phone,
      address,
    });
    
    // Trả về thông tin user vừa tạo (KHÔNG trả về password)
    // HTTP status 201 Created: Tài nguyên mới đã được tạo thành công
    return res
      .status(201)
      .json({ user_id: user.user_id, name: user.name, email: user.email });
  } catch (err) {
    // Nếu có lỗi bất kỳ → trả lỗi 500 Internal Server Error
    return res.status(500).json({ message: "Server error" });
  }
});

// Route POST /api/auth/login: Đăng nhập
// validateLogin: Middleware kiểm tra dữ liệu đầu vào (email, password có đủ không)
router.post("/login", validateLogin, async (req, res) => {
  try {
    // Lấy email và password từ request body
    const { email, password } = req.body;
    
    // Tìm user trong database theo email
    const user = await User.findOne({ where: { email } });
    
    // Nếu không tìm thấy user → trả lỗi 401 Unauthorized
    // Không nói rõ là email sai hay password sai để tránh bị brute force
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    
    // So sánh password người dùng nhập với password đã hash trong database
    // bcrypt.compare(): So sánh plain text password với hash
    // Trả về true nếu khớp, false nếu không khớp
    const ok = await bcrypt.compare(password, user.password);
    
    // Nếu password không khớp → trả lỗi 401 Unauthorized
    if (!ok) return res.status(401).json({ message: "Invalid credentials" });
    
    // Lấy JWT secret từ biến môi trường, nếu không có thì dùng secret mặc định
    // JWT_SECRET: Khóa bí mật để ký token (phải giữ bí mật)
    const secret = process.env.JWT_SECRET || "dev_secret_change_me";
    
    // Tạo JWT token chứa thông tin user
    // jwt.sign(payload, secret, options):
    // - payload: Dữ liệu lưu trong token (user_id, role, email)
    // - secret: Khóa bí mật để ký token
    // - expiresIn: "7d" → token hết hạn sau 7 ngày
    const token = jwt.sign(
      { user_id: user.user_id, role: user.role, email: user.email },
      secret,
      { expiresIn: "7d" }
    );
    
    // Trả về token cho client
    // Client sẽ lưu token và gửi kèm trong header Authorization: Bearer <token>
    return res.json({ token });
  } catch (err) {
    // Nếu có lỗi → trả lỗi 500 Internal Server Error
    return res.status(500).json({ message: "Server error" });
  }
});

// Route POST /api/auth/logout: Đăng xuất
// Stateless logout: JWT là stateless (không lưu trữ trên server)
// Client chỉ cần xóa token ở phía client (localStorage, cookie, v.v.)
// Server không cần làm gì vì không có session để xóa
router.post("/logout", (req, res) => {
  // Trả về message xác nhận đã đăng xuất
  // Client sẽ xóa token khỏi localStorage/cookie
  return res.json({ message: "Logged out" });
});

// Route GET /api/auth/me: Lấy thông tin user hiện tại
// authenticate: Middleware kiểm tra user đã đăng nhập (có token hợp lệ)
// req.user: Thông tin user đã được authenticate middleware set (từ JWT token)
router.get("/me", authenticate, async (req, res) => {
  try {
    // Tìm user theo user_id từ token
    // req.user.user_id: Lấy từ JWT token (đã được authenticate middleware decode)
    // attributes: exclude password để không trả về mật khẩu
    const user = await User.findByPk(req.user.user_id, {
      attributes: {
        exclude: ['password'] // Loại bỏ password, lấy tất cả các trường khác
      }
    });
    
    // Nếu không tìm thấy user (token hợp lệ nhưng user đã bị xóa) → trả lỗi 404
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Trả về thông tin user (Sequelize tự động serialize thành JSON)
    return res.json(user);
  } catch (err) {
    // Log lỗi để debug
    console.error('Error in /auth/me:', err);
    // Nếu có lỗi → trả lỗi 500 Internal Server Error
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Route POST /api/auth/change-password: Đổi mật khẩu
// authenticate: Phải đăng nhập mới đổi được mật khẩu
// validateChangePassword: Kiểm tra dữ liệu đầu vào (current_password, new_password)
router.post("/change-password", authenticate, validateChangePassword, async (req, res) => {
  try {
    // Lấy mật khẩu hiện tại và mật khẩu mới từ request body
    const { current_password, new_password } = req.body;
    
    // Kiểm tra có đủ thông tin không
    if (!current_password || !new_password) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Tìm user theo user_id từ token
    const user = await User.findByPk(req.user.user_id);
    
    // Nếu không tìm thấy user → trả lỗi 404
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Kiểm tra mật khẩu hiện tại có đúng không
    // bcrypt.compare(): So sánh mật khẩu người dùng nhập với mật khẩu trong database
    const ok = await bcrypt.compare(current_password, user.password);
    
    // Nếu mật khẩu hiện tại sai → trả lỗi 401 Unauthorized
    if (!ok)
      return res.status(401).json({ message: "Current password incorrect" });
    
    // Hash mật khẩu mới
    const hash = await bcrypt.hash(new_password, 10);
    
    // Cập nhật mật khẩu mới vào database
    user.password = hash;
    await user.save(); // Lưu thay đổi vào database
    
    // Trả về message xác nhận đã đổi mật khẩu thành công
    return res.json({ message: "Password updated" });
  } catch (err) {
    // Nếu có lỗi → trả lỗi 500 Internal Server Error
    return res.status(500).json({ message: "Server error" });
  }
});

// ======================================================================
// HELPER FUNCTIONS: Xử lý danh sách sản phẩm yêu thích
// ======================================================================

// Hàm parse chuỗi JSON thành mảng số
// favourite_product được lưu dưới dạng JSON string: "[1,2,3]"
// parseFavorites(): Chuyển "[1,2,3]" → [1, 2, 3]
function parseFavorites(str) {
  // Nếu chuỗi rỗng hoặc null/undefined → trả về mảng rỗng
  if (!str) return [];
  
  try {
    // JSON.parse(): Chuyển JSON string thành JavaScript object/array
    const arr = JSON.parse(str);
    
    // Kiểm tra kết quả có phải là array không
    // Nếu là array → trả về, nếu không → trả về mảng rỗng
    return Array.isArray(arr) ? arr : [];
  } catch {
    // Nếu parse lỗi (JSON không hợp lệ) → trả về mảng rỗng
    return [];
  }
}

// Hàm chuyển mảng số thành JSON string
// stringifyFavorites(): Chuyển [1, 2, 3] → "[1,2,3]"
function stringifyFavorites(arr) {
  try {
    // Chuyển mảng thành JSON string với các bước:
    // 1. arr.map((n) => Number(n)): Chuyển tất cả phần tử thành number
    // 2. .filter((n) => Number.isFinite(n)): Chỉ giữ lại các số hợp lệ (loại bỏ NaN, Infinity)
    // 3. new Set(...): Loại bỏ các số trùng lặp
    // 4. Array.from(...): Chuyển Set thành Array
    // 5. JSON.stringify(...): Chuyển Array thành JSON string
    return JSON.stringify(
      Array.from(
        new Set(arr.map((n) => Number(n)).filter((n) => Number.isFinite(n)))
      )
    );
  } catch {
    // Nếu có lỗi → trả về JSON string mảng rỗng
    return "[]";
  }
}

// Route GET /api/auth/favorites: Lấy danh sách sản phẩm yêu thích của user hiện tại
// authenticate: Phải đăng nhập mới xem được danh sách yêu thích
router.get("/favorites", authenticate, async (req, res) => {
  try {
    // Tìm user theo user_id từ token
    const user = await User.findByPk(req.user.user_id);
    
    // Nếu không tìm thấy user → trả lỗi 404
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Parse chuỗi JSON thành mảng số
    // user.favourite_product: JSON string "[1,2,3]" → parseFavorites() → [1, 2, 3]
    const favs = parseFavorites(user.favourite_product);
    
    // Trả về danh sách ID sản phẩm yêu thích
    return res.json({ favorites: favs });
  } catch (err) {
    // Nếu có lỗi → trả lỗi 500 Internal Server Error
    return res.status(500).json({ message: "Server error" });
  }
});

// Route POST /api/auth/favorites/toggle: Thêm/xóa sản phẩm khỏi danh sách yêu thích
// authenticate: Phải đăng nhập mới thêm/xóa được
// Toggle: Nếu sản phẩm đã có trong danh sách → xóa, nếu chưa có → thêm
router.post("/favorites/toggle", authenticate, async (req, res) => {
  try {
    // Lấy product_id từ request body
    const { product_id } = req.body;
    
    // Kiểm tra có product_id không
    if (!product_id)
      return res.status(400).json({ message: "product_id required" });
    
    // Tìm user theo user_id từ token
    const user = await User.findByPk(req.user.user_id);
    
    // Nếu không tìm thấy user → trả lỗi 404
    if (!user) return res.status(404).json({ message: "User not found" });
    
    // Parse danh sách yêu thích hiện tại thành mảng
    const favs = parseFavorites(user.favourite_product);
    
    // Chuyển product_id thành number
    const pid = Number(product_id);
    
    // Tìm vị trí của product_id trong mảng (nếu có)
    const idx = favs.indexOf(pid);
    
    // Nếu đã có trong danh sách (idx >= 0) → xóa khỏi danh sách
    if (idx >= 0) {
      favs.splice(idx, 1); // splice(idx, 1): Xóa 1 phần tử tại vị trí idx
    } else {
      // Nếu chưa có trong danh sách → thêm vào
      favs.push(pid);
    }
    
    // Chuyển mảng thành JSON string và lưu vào database
    user.favourite_product = stringifyFavorites(favs);
    await user.save(); // Lưu thay đổi
    
    // Trả về danh sách yêu thích sau khi cập nhật
    return res.json({ favorites: favs });
  } catch (err) {
    // Nếu có lỗi → trả lỗi 500 Internal Server Error
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
