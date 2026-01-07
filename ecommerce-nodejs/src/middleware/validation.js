// Import express-validator để validate dữ liệu đầu vào
// body: Validate dữ liệu trong request body
// validationResult: Lấy kết quả validation (có lỗi hay không)
const { body, validationResult } = require('express-validator');

// Middleware xử lý lỗi validation
// Middleware này sẽ được gọi sau các validation rules
// Nếu có lỗi → trả về lỗi 400 với danh sách lỗi
// Nếu không có lỗi → gọi next() để chuyển sang middleware/route tiếp theo
const handleValidationErrors = (req, res, next) => {
  // Lấy kết quả validation từ request
  // validationResult(req): Lấy tất cả lỗi validation (nếu có)
  const errors = validationResult(req);
  
  // Nếu có lỗi (errors không rỗng)
  if (!errors.isEmpty()) {
    // Trả về lỗi 400 Bad Request với danh sách lỗi chi tiết
    return res.status(400).json({
      message: 'Validation failed',  // Thông báo chung
      // errors: Mảng chứa các lỗi chi tiết
      errors: errors.array().map(error => ({
        field: error.path,      // Tên trường bị lỗi (ví dụ: 'email', 'password')
        message: error.msg,     // Thông báo lỗi (ví dụ: 'Email không hợp lệ')
        value: error.value      // Giá trị người dùng nhập (để hiển thị lại)
      }))
    });
  }
  
  // Nếu không có lỗi → gọi next() để chuyển sang middleware/route tiếp theo
  next();
};

// ======================================================================
// VALIDATION RULES: Các quy tắc kiểm tra dữ liệu đầu vào
// ======================================================================

// Validation rules cho đăng ký tài khoản
// Mảng các middleware validation, mỗi middleware kiểm tra một trường
const validateRegister = [
  // Validate trường 'name' (tên người dùng)
  body('name')
    .trim()  // Xóa khoảng trắng ở đầu và cuối
    .isLength({ min: 2, max: 50 })  // Kiểm tra độ dài: tối thiểu 2, tối đa 50 ký tự
    .withMessage('Tên phải có từ 2-50 ký tự')  // Thông báo lỗi nếu không đúng
    // Kiểm tra tên chỉ chứa chữ cái (tiếng Việt) và khoảng trắng
    // Regex: Cho phép chữ cái tiếng Anh, tiếng Việt (có dấu), và khoảng trắng
    .matches(/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠưăâêôơ\s]+$/)
    .withMessage('Tên chỉ được chứa chữ cái và khoảng trắng'),

  // Validate trường 'email'
  body('email')
    .trim()  // Xóa khoảng trắng ở đầu và cuối
    .isEmail()  // Kiểm tra định dạng email hợp lệ (có @, domain, v.v.)
    .withMessage('Email không hợp lệ')
    .normalizeEmail()  // Chuẩn hóa email (chuyển thành chữ thường, xóa dấu chấm thừa)
    .isLength({ max: 100 })  // Kiểm tra độ dài tối đa 100 ký tự
    .withMessage('Email không được quá 100 ký tự'),

  // Validate trường 'password' (mật khẩu)
  body('password')
    .isLength({ min: 8, max: 128 })  // Độ dài: tối thiểu 8, tối đa 128 ký tự
    .withMessage('Mật khẩu phải có từ 8-128 ký tự')
    // Kiểm tra mật khẩu phải chứa:
    // (?=.*[a-z]): Ít nhất 1 chữ thường
    // (?=.*[A-Z]): Ít nhất 1 chữ hoa
    // (?=.*\d): Ít nhất 1 số
    // (?=.*[@$!%*?&]): Ít nhất 1 ký tự đặc biệt
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'),

  // Validate trường 'phone' (số điện thoại) - KHÔNG BẮT BUỘC
  body('phone')
    .optional()  // Trường này không bắt buộc (có thể không có)
    .trim()  // Xóa khoảng trắng
    // Kiểm tra định dạng số điện thoại Việt Nam
    // Regex: Bắt đầu bằng +84, 84, hoặc 0, sau đó là 9 chữ số (bắt đầu từ 1-9)
    .matches(/^(\+84|84|0)[1-9][0-9]{8}$/)
    .withMessage('Số điện thoại không hợp lệ. Ví dụ: 0123456789 hoặc +84123456789'),

  // Validate trường 'address' (địa chỉ) - KHÔNG BẮT BUỘC
  body('address')
    .optional()  // Trường này không bắt buộc
    .trim()  // Xóa khoảng trắng
    .isLength({ min: 5, max: 200 })  // Độ dài: tối thiểu 5, tối đa 200 ký tự
    .withMessage('Địa chỉ phải có từ 5-200 ký tự')
    // Kiểm tra địa chỉ chỉ chứa chữ cái, số, khoảng trắng, dấu phẩy, dấu chấm, dấu gạch ngang
    .matches(/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠưăâêôơ0-9\s,.-]+$/)
    .withMessage('Địa chỉ chứa ký tự không hợp lệ'),

  // Middleware xử lý lỗi validation (sẽ được gọi sau tất cả validation rules)
  handleValidationErrors
];

// Validation rules cho đăng nhập
const validateLogin = [
  // Validate trường 'email'
  body('email')
    .trim()  // Xóa khoảng trắng
    .isEmail()  // Kiểm tra định dạng email hợp lệ
    .withMessage('Email không hợp lệ')
    .normalizeEmail(),  // Chuẩn hóa email

  // Validate trường 'password'
  body('password')
    .notEmpty()  // Kiểm tra không được để trống
    .withMessage('Mật khẩu không được để trống')
    .isLength({ min: 1, max: 128 })  // Độ dài: tối thiểu 1, tối đa 128 ký tự
    .withMessage('Mật khẩu không được quá 128 ký tự'),

  // Middleware xử lý lỗi validation
  handleValidationErrors
];

// Validation rules cho đổi mật khẩu
const validateChangePassword = [
  // Validate trường 'current_password' (mật khẩu hiện tại)
  body('current_password')
    .notEmpty()  // Kiểm tra không được để trống
    .withMessage('Mật khẩu hiện tại không được để trống'),

  // Validate trường 'new_password' (mật khẩu mới)
  body('new_password')
    .isLength({ min: 8, max: 128 })  // Độ dài: tối thiểu 8, tối đa 128 ký tự
    .withMessage('Mật khẩu mới phải có từ 8-128 ký tự')
    // Kiểm tra mật khẩu mới phải chứa: chữ thường, chữ hoa, số, ký tự đặc biệt
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Mật khẩu mới phải chứa ít nhất 1 chữ thường, 1 chữ hoa, 1 số và 1 ký tự đặc biệt'),

  // Middleware xử lý lỗi validation
  handleValidationErrors
];

// Validation rules cho cập nhật thông tin cá nhân
const validateUpdateProfile = [
  // Validate trường 'name' (tên) - KHÔNG BẮT BUỘC (có thể không cập nhật)
  body('name')
    .optional()  // Trường này không bắt buộc
    .trim()  // Xóa khoảng trắng
    .isLength({ min: 2, max: 50 })  // Độ dài: tối thiểu 2, tối đa 50 ký tự
    .withMessage('Tên phải có từ 2-50 ký tự')
    // Kiểm tra tên chỉ chứa chữ cái và khoảng trắng
    .matches(/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠưăâêôơ\s]+$/)
    .withMessage('Tên chỉ được chứa chữ cái và khoảng trắng'),

  // Validate trường 'phone' (số điện thoại) - KHÔNG BẮT BUỘC
  body('phone')
    .optional()  // Trường này không bắt buộc
    .trim()  // Xóa khoảng trắng
    // Kiểm tra định dạng số điện thoại Việt Nam
    .matches(/^(\+84|84|0)[1-9][0-9]{8}$/)
    .withMessage('Số điện thoại không hợp lệ. Ví dụ: 0123456789 hoặc +84123456789'),

  // Validate trường 'address' (địa chỉ) - KHÔNG BẮT BUỘC
  body('address')
    .optional()  // Trường này không bắt buộc
    .trim()  // Xóa khoảng trắng
    .isLength({ min: 5, max: 200 })  // Độ dài: tối thiểu 5, tối đa 200 ký tự
    .withMessage('Địa chỉ phải có từ 5-200 ký tự')
    // Kiểm tra địa chỉ chỉ chứa chữ cái, số, khoảng trắng, dấu phẩy, dấu chấm, dấu gạch ngang
    .matches(/^[a-zA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠưăâêôơ0-9\s,.-]+$/)
    .withMessage('Địa chỉ chứa ký tự không hợp lệ'),

  // Middleware xử lý lỗi validation
  handleValidationErrors
];

// Export tất cả các validation middleware để các file khác có thể sử dụng
module.exports = {
  validateRegister,      // Validation cho đăng ký
  validateLogin,         // Validation cho đăng nhập
  validateChangePassword, // Validation cho đổi mật khẩu
  validateUpdateProfile, // Validation cho cập nhật profile
  handleValidationErrors // Middleware xử lý lỗi validation
};

