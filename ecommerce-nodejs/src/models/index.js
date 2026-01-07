// Import DataTypes từ Sequelize - chứa các kiểu dữ liệu cho database columns
// DataTypes.STRING, DataTypes.INTEGER, DataTypes.DECIMAL, v.v.
const { DataTypes } = require('sequelize');

// Import sequelize instance từ file database.js
// sequelize dùng để định nghĩa các model (bảng) trong database
const { sequelize } = require('../config/database');

// Hàm định nghĩa tất cả các model (bảng) trong database
// Hàm này sẽ tạo các model: User, Category, Product, Order, OrderDetail, Review, Banner
const defineModels = () => {
  // Định nghĩa model User (bảng users trong database)
  // sequelize.define('ModelName', { columns }, { options })
  const User = sequelize.define('User', {
    // user_id: Khóa chính, tự động tăng, kiểu INTEGER không dấu
    // autoIncrement: true → tự động tăng mỗi khi tạo record mới (1, 2, 3, ...)
    // primaryKey: true → đây là khóa chính của bảng
    user_id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    
    // name: Tên người dùng, kiểu STRING tối đa 100 ký tự, bắt buộc (không được null)
    name: { type: DataTypes.STRING(100), allowNull: false },
    
    // email: Email người dùng, kiểu STRING tối đa 120 ký tự, bắt buộc, phải duy nhất (unique)
    // unique: true → không được trùng email (mỗi email chỉ đăng ký 1 tài khoản)
    email: { type: DataTypes.STRING(120), allowNull: false, unique: true },
    
    // password: Mật khẩu đã được hash (bcrypt), kiểu STRING tối đa 255 ký tự, bắt buộc
    password: { type: DataTypes.STRING(255), allowNull: false },
    
    // phone: Số điện thoại, kiểu STRING tối đa 20 ký tự, không bắt buộc (có thể null)
    phone: { type: DataTypes.STRING(20) },
    
    // address: Địa chỉ, kiểu STRING tối đa 255 ký tự, không bắt buộc
    address: { type: DataTypes.STRING(255) },
    
    // role: Vai trò người dùng, chỉ có 2 giá trị: 'user' hoặc 'admin'
    // allowNull: false → bắt buộc phải có
    // defaultValue: 'user' → mặc định là 'user' nếu không chỉ định
    role: { type: DataTypes.ENUM('user', 'admin'), allowNull: false, defaultValue: 'user' },
    
    // favourite_product: Lưu danh sách ID sản phẩm yêu thích dưới dạng JSON string
    // Ví dụ: "[1,2,3]" → danh sách sản phẩm có ID 1, 2, 3
    // DataTypes.TEXT: Kiểu TEXT (không giới hạn độ dài)
    favourite_product: { type: DataTypes.TEXT }
  }, { 
    tableName: 'users',  // tableName: 'users' → tên bảng trong database là 'users' (không phải 'Users')
    timestamps: true     // timestamps: true → tự động thêm createdAt, updatedAt (sẽ map thành created_at, updated_at vì underscored: true)
  });

  // Định nghĩa model Category (bảng categories trong database)
  // Category: Danh mục sản phẩm (ví dụ: Điện thoại, Laptop, Phụ kiện)
  const Category = sequelize.define('Category', {
    // category_id: Khóa chính, tự động tăng
    category_id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    
    // name: Tên danh mục, bắt buộc, tối đa 100 ký tự
    name: { type: DataTypes.STRING(100), allowNull: false },
    
    // description: Mô tả danh mục, không bắt buộc, kiểu TEXT (không giới hạn độ dài)
    description: { type: DataTypes.TEXT }
  }, { 
    tableName: 'categories',  // Tên bảng trong database là 'categories'
    timestamps: true           // timestamps: true → tự động thêm createdAt, updatedAt
  });

  // Định nghĩa model Product (bảng products trong database)
  // Product: Sản phẩm trong cửa hàng
  const Product = sequelize.define('Product', {
    // product_id: Khóa chính, tự động tăng
    product_id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    
    // name: Tên sản phẩm, bắt buộc, tối đa 150 ký tự
    name: { type: DataTypes.STRING(150), allowNull: false },
    
    // description: Mô tả sản phẩm, không bắt buộc, kiểu TEXT
    description: { type: DataTypes.TEXT },
    
    // price: Giá gốc, kiểu DECIMAL(12,2) → tối đa 12 chữ số, 2 chữ số thập phân
    // Ví dụ: 9999999999.99 (gần 10 tỷ)
    price: { type: DataTypes.DECIMAL(12,2), allowNull: false },
    
    // sale_price: Giá khuyến mãi (nếu có), kiểu DECIMAL(12,2), không bắt buộc
    sale_price: { type: DataTypes.DECIMAL(12,2) },
    
    // stock: Số lượng tồn kho, kiểu INTEGER không dấu, mặc định là 0
    stock: { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
    
    // brand: Thương hiệu sản phẩm (ví dụ: Apple, Samsung), tối đa 100 ký tự
    brand: { type: DataTypes.STRING(100) },
    
    // ram: Dung lượng RAM (ví dụ: "8GB"), tối đa 20 ký tự
    ram: { type: DataTypes.STRING(20) },
    
    // storage: Dung lượng lưu trữ (ví dụ: "128GB", "256GB"), tối đa 50 ký tự
    storage: { type: DataTypes.STRING(50) },
    
    // image_url: Đường dẫn đến ảnh sản phẩm, tối đa 255 ký tự
    image_url: { type: DataTypes.STRING(255) },
    
    // category_id: ID danh mục sản phẩm (foreign key đến bảng categories)
    category_id: { type: DataTypes.INTEGER.UNSIGNED },
    
    // is_promotion: Cờ đánh dấu sản phẩm khuyến mãi, kiểu BOOLEAN, mặc định false
    is_promotion: { type: DataTypes.BOOLEAN, defaultValue: false },
    
    // is_new: Cờ đánh dấu sản phẩm mới về, kiểu BOOLEAN, mặc định false
    is_new: { type: DataTypes.BOOLEAN, defaultValue: false }
  }, { 
    tableName: 'products',  // Tên bảng trong database là 'products'
    timestamps: true        // timestamps: true → tự động thêm 2 cột: createdAt, updatedAt
  });                      // createdAt: Thời gian tạo, updatedAt: Thời gian cập nhật

  // Định nghĩa model Order (bảng orders trong database)
  // Order: Đơn hàng của khách hàng
  const Order = sequelize.define('Order', {
    // order_id: Khóa chính, tự động tăng
    order_id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    
    // user_id: ID người dùng đặt hàng (foreign key đến bảng users), bắt buộc
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    
    // total_price: Tổng tiền đơn hàng, kiểu DECIMAL(12,2), bắt buộc
    total_price: { type: DataTypes.DECIMAL(12,2), allowNull: false },
    
    // payment_method: Phương thức thanh toán, chỉ có 2 giá trị: 'COD' (tiền mặt) hoặc 'ONLINE'
    payment_method: { type: DataTypes.ENUM('COD', 'ONLINE'), allowNull: false },
    
    // status: Trạng thái đơn hàng, có 4 giá trị: 'pending', 'shipped', 'done', 'cancel'
    // defaultValue: 'pending' → mặc định là 'pending' (chờ xử lý)
    status: { type: DataTypes.ENUM('pending', 'shipped', 'done', 'cancel'), defaultValue: 'pending' }
  }, { 
    tableName: 'orders',  // Tên bảng trong database là 'orders'
    timestamps: false      // timestamps: false vì bảng orders không có created_at, updated_at
  });

  // Định nghĩa model OrderDetail (bảng order_details trong database)
  // OrderDetail: Chi tiết đơn hàng (mỗi sản phẩm trong đơn hàng là 1 record)
  // Một đơn hàng có thể có nhiều OrderDetail (1 đơn hàng có nhiều sản phẩm)
  const OrderDetail = sequelize.define('OrderDetail', {
    // order_detail_id: Khóa chính, tự động tăng
    order_detail_id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    
    // order_id: ID đơn hàng (foreign key đến bảng orders), bắt buộc
    order_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    
    // product_id: ID sản phẩm (foreign key đến bảng products), bắt buộc
    product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    
    // quantity: Số lượng sản phẩm trong đơn hàng, bắt buộc
    quantity: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    
    // price: Giá sản phẩm tại thời điểm đặt hàng (lưu lại để không bị ảnh hưởng khi giá thay đổi)
    // Kiểu DECIMAL(12,2), bắt buộc
    price: { type: DataTypes.DECIMAL(12,2), allowNull: false }
  }, { 
    tableName: 'order_details',  // Tên bảng trong database là 'order_details'
    timestamps: false            // Không có timestamps trong bảng order_details
  });

  // Định nghĩa model Review (bảng reviews trong database)
  // Review: Đánh giá sản phẩm từ người dùng
  const Review = sequelize.define('Review', {
    // review_id: Khóa chính, tự động tăng
    review_id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    
    // product_id: ID sản phẩm được đánh giá (foreign key đến bảng products), bắt buộc
    product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    
    // user_id: ID người dùng viết đánh giá (foreign key đến bảng users), bắt buộc
    user_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    
    // rating: Điểm đánh giá (ví dụ: 1-5 sao), kiểu INTEGER không dấu, bắt buộc
    rating: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
    
    // comment: Nội dung đánh giá, kiểu TEXT (không giới hạn độ dài), không bắt buộc
    comment: { type: DataTypes.TEXT }
  }, { tableName: 'reviews' }); // Tên bảng trong database là 'reviews'

  // Định nghĩa model Banner (bảng banners trong database)
  // Banner: Banner quảng cáo hiển thị trên trang chủ
  const Banner = sequelize.define('Banner', {
    // banner_id: Khóa chính, tự động tăng
    banner_id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    
    // title: Tiêu đề banner, tối đa 150 ký tự, không bắt buộc
    title: { type: DataTypes.STRING(150) },
    
    // image_url: Đường dẫn đến ảnh banner, tối đa 255 ký tự, không bắt buộc
    image_url: { type: DataTypes.STRING(255) },
    
    // link: Link khi click vào banner (ví dụ: /products/1), tối đa 255 ký tự, không bắt buộc
    link: { type: DataTypes.STRING(255) }
  }, { 
    tableName: 'banners',  // Tên bảng trong database là 'banners'
    timestamps: false      // Không có timestamps trong bảng banners
  });

  // ======================================================================
  // ASSOCIATIONS: Định nghĩa mối quan hệ giữa các bảng
  // ======================================================================
  // Lưu ý: indexes: false → Tắt tự động tạo index cho foreign key
  // Lý do: MySQL/MariaDB có giới hạn 64 keys (indexes) mỗi bảng
  // Nếu tạo quá nhiều index tự động → lỗi "Too many keys specified; max 64 keys allowed"
  
  // Mối quan hệ: Category (1) - Product (nhiều)
  // Một danh mục có nhiều sản phẩm, một sản phẩm thuộc một danh mục
  Category.hasMany(Product, { foreignKey: 'category_id', indexes: false });  // Category có nhiều Product
  Product.belongsTo(Category, { foreignKey: 'category_id', indexes: false }); // Product thuộc về Category

  // Mối quan hệ: User (1) - Order (nhiều)
  // Một người dùng có nhiều đơn hàng, một đơn hàng thuộc về một người dùng
  User.hasMany(Order, { foreignKey: 'user_id', indexes: false });  // User có nhiều Order
  Order.belongsTo(User, { foreignKey: 'user_id', indexes: false }); // Order thuộc về User

  // Mối quan hệ: Order (1) - OrderDetail (nhiều)
  // Một đơn hàng có nhiều chi tiết đơn hàng, một chi tiết thuộc về một đơn hàng
  Order.hasMany(OrderDetail, { foreignKey: 'order_id', indexes: false });      // Order có nhiều OrderDetail
  OrderDetail.belongsTo(Order, { foreignKey: 'order_id', indexes: false });    // OrderDetail thuộc về Order

  // Mối quan hệ: Product (1) - OrderDetail (nhiều)
  // Một sản phẩm có thể xuất hiện trong nhiều chi tiết đơn hàng
  Product.hasMany(OrderDetail, { foreignKey: 'product_id', indexes: false });  // Product có nhiều OrderDetail
  OrderDetail.belongsTo(Product, { foreignKey: 'product_id', indexes: false }); // OrderDetail thuộc về Product

  // Mối quan hệ: Product (1) - Review (nhiều)
  // Một sản phẩm có nhiều đánh giá, một đánh giá thuộc về một sản phẩm
  Product.hasMany(Review, { foreignKey: 'product_id', indexes: false });  // Product có nhiều Review
  Review.belongsTo(Product, { foreignKey: 'product_id', indexes: false }); // Review thuộc về Product

  // Mối quan hệ: User (1) - Review (nhiều)
  // Một người dùng có thể viết nhiều đánh giá, một đánh giá thuộc về một người dùng
  User.hasMany(Review, { foreignKey: 'user_id', indexes: false });  // User có nhiều Review
  Review.belongsTo(User, { foreignKey: 'user_id', indexes: false }); // Review thuộc về User

  // Trả về object chứa sequelize instance và tất cả các model đã định nghĩa
  // Các file khác có thể import và sử dụng các model này
  return { sequelize, User, Category, Product, Order, OrderDetail, Review, Banner };
};

// Export hàm defineModels để các file khác có thể gọi và lấy các model
module.exports = { defineModels };


