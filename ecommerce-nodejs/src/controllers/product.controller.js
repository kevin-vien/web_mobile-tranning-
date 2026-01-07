// const { defineModels } = require('../models');
// const { Op } = require('sequelize');
// const { Product, Category } = defineModels();
// const { sequelize } = require('../config/database');

// async function listProducts(req, res) {
//   try {
//     const { category, brand, min_price, max_price, ram, storage, limit = 8, random = false, search } = req.query;
//     const where = {};

//     // Search functionality
//     if (search) {
//       where[Op.or] = [
//         { name: { [Op.like]: `%${search}%` } },
//         { brand: { [Op.like]: `%${search}%` } },
//         { description: { [Op.like]: `%${search}%` } }
//       ];
//     }

//     if (brand) where.brand = brand;
//     if (ram) where.ram = ram;
//     if (storage) where.storage = storage;
//     if (min_price || max_price) {
//       where.price = {};
//       if (min_price) where.price[Op.gte] = Number(min_price);
//       if (max_price) where.price[Op.lte] = Number(max_price);
//     }

//     const include = [];
//     if (category) include.push({ model: Category, where: { name: category }, required: true });

//     const options = {
//       where,
//       include,
//       limit: Number(limit)
//     };

//     if (random === 'true') {
//       options.order = sequelize.random();
//     }

//     const products = await Product.findAll(options);
//     return res.json(products);
//   } catch (err) {
//     return res.status(500).json({ message: 'Server error' });
//   }
// }

// async function getProduct(req, res) {
//   try {
//     const product = await Product.findByPk(req.params.id, { include: [Category] });
//     if (!product) return res.status(404).json({ message: 'Not found' });
//     return res.json(product);
//   } catch (err) {
//     return res.status(500).json({ message: 'Server error' });
//   }
// }

// async function createProduct(req, res) {
//   try {
//     const product = await Product.create(req.body);
//     return res.status(201).json(product);
//   } catch (err) {
//     return res.status(400).json({ message: 'Invalid data' });
//   }
// }

// async function updateProduct(req, res) {
//   try {
//     const product = await Product.findByPk(req.params.id);
//     if (!product) return res.status(404).json({ message: 'Not found' });
//     await product.update(req.body);
//     return res.json(product);
//   } catch (err) {
//     return res.status(400).json({ message: 'Invalid data' });
//   }
// }

// async function deleteProduct(req, res) {
//   try {
//     const product = await Product.findByPk(req.params.id);
//     if (!product) return res.status(404).json({ message: 'Not found' });
//     await product.destroy();
//     return res.json({ success: true });
//   } catch (err) {
//     return res.status(500).json({ message: 'Server error' });
//   }
// }

// module.exports = {
//   listProducts,
//   getProduct,
//   createProduct,
//   updateProduct,
//   deleteProduct
// };
// 🧩 Import các thành phần cần thiết
const { defineModels } = require("../models"); // Lấy hàm định nghĩa các model từ thư mục models
const { Op } = require("sequelize"); // Import các toán tử Sequelize (vd: like, or, gte, lte,...)
const models = defineModels(); // Gọi defineModels() để lấy ra tất cả models
const { Product, Category, OrderDetail } = models; // Lấy các model từ kết quả
const { sequelize } = require("../config/database"); // Lấy đối tượng sequelize đã cấu hình kết nối đến DB

// ======================================================================
// 📦 HÀM 1: LẤY DANH SÁCH SẢN PHẨM (CÓ LỌC VÀ TÌM KIẾM)
// ======================================================================
async function listProducts(req, res) {
  try {
    // Lấy các tham số lọc từ query string (URL)
    const {
      category,
      category_id,
      brand,
      min_price,
      max_price,
      ram,
      storage,
      limit = 8,
      random = false,
      search,
    } = req.query;

    // Tạo object "where" để chứa điều kiện lọc cho truy vấn SQL
    const where = {};

    // 🔍 Nếu có tham số "search" (người dùng nhập từ khóa tìm kiếm)
    if (search) {
      // Tạo điều kiện tìm kiếm theo tên, thương hiệu, mô tả (dùng LIKE)
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { brand: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
      ];
    }

    // Lọc theo thương hiệu, ram, storage, category_id (nếu có)
    if (brand) where.brand = brand;
    if (ram) where.ram = ram;
    if (storage) where.storage = storage;
    if (category_id) where.category_id = Number(category_id);

    // Lọc theo giá tiền (min_price, max_price)
    if (min_price || max_price) {
      where.price = {}; // Khởi tạo object con cho điều kiện giá
      if (min_price) where.price[Op.gte] = Number(min_price); // Giá >= min_price
      if (max_price) where.price[Op.lte] = Number(max_price); // Giá <= max_price
    }

    // Tạo mảng "include" để join (liên kết) với bảng Category
    const include = [];
    // Nếu có category name (không có category_id) thì join với Category và filter theo name
    if (category && !category_id) {
      include.push({
        model: Category, // Join với bảng Category
        where: { name: category }, // Chỉ lấy sản phẩm thuộc category này
        required: true, // required = true => chỉ lấy nếu có Category khớp
      });
    } else {
      // Luôn include Category để hiển thị thông tin category trong response
      include.push({
        model: Category,
        required: false // required = false vì đã filter theo category_id trong where
      });
    }

    // Tạo object "options" để truyền vào findAll()
    const options = {
      where, // Điều kiện lọc
      include, // Bảng liên kết
      limit: Number(limit), // Giới hạn số sản phẩm trả về (mặc định 8)
    };

    // Nếu người dùng muốn lấy ngẫu nhiên (random = true)
    if (random === "true") {
      options.order = sequelize.random(); // Sắp xếp ngẫu nhiên
    }

    // 🧠 Thực hiện truy vấn: SELECT * FROM products WHERE ...
    const products = await Product.findAll(options);

    // ✅ Trả kết quả về client (dạng JSON)
    return res.json(products);
  } catch (err) {
    // ❌ Nếu có lỗi (lỗi server hoặc kết nối DB)
    return res.status(500).json({ message: "Server error" });
  }
}

// ======================================================================
// 📦 HÀM 2: LẤY CHI TIẾT MỘT SẢN PHẨM THEO ID
// ======================================================================
async function getProduct(req, res) {
  try {
    // Tìm sản phẩm theo khóa chính (ID) và kèm thông tin Category
    const product = await Product.findByPk(req.params.id, {
      include: [Category],
    });

    // Nếu không tìm thấy sản phẩm
    if (!product) return res.status(404).json({ message: "Not found" });

    // Trả về dữ liệu sản phẩm
    return res.json(product);
  } catch (err) {
    // Lỗi server
    return res.status(500).json({ message: "Server error" });
  }
}

// ======================================================================
// 📦 HÀM 3: TẠO SẢN PHẨM MỚI
// ======================================================================
async function createProduct(req, res) {
  try {
    // Tạo bản ghi mới trong bảng Product từ dữ liệu client gửi (req.body)
    const product = await Product.create(req.body);

    // Trả về sản phẩm vừa tạo + mã HTTP 201 (Created)
    return res.status(201).json(product);
  } catch (err) {
    // Nếu dữ liệu không hợp lệ (vd: thiếu trường bắt buộc)
    return res.status(400).json({ message: "Invalid data" });
  }
}

// ======================================================================
// 📦 HÀM 4: CẬP NHẬT SẢN PHẨM
// ======================================================================
async function updateProduct(req, res) {
  try {
    // Tìm sản phẩm theo ID
    const product = await Product.findByPk(req.params.id);

    // Nếu không tồn tại sản phẩm
    if (!product) return res.status(404).json({ message: "Not found" });

    // Cập nhật dữ liệu sản phẩm từ req.body
    await product.update(req.body);

    // Trả về dữ liệu sau khi cập nhật
    return res.json(product);
  } catch (err) {
    // Lỗi dữ liệu hoặc câu truy vấn
    return res.status(400).json({ message: "Invalid data" });
  }
}

// ======================================================================
// 📦 HÀM 5: XÓA SẢN PHẨM
// ======================================================================
async function deleteProduct(req, res) {
  try {
    // Tìm sản phẩm theo ID
    const product = await Product.findByPk(req.params.id);

    // Nếu không tìm thấy sản phẩm
    if (!product) return res.status(404).json({ message: "Not found" });

    // Xóa sản phẩm khỏi cơ sở dữ liệu
    await product.destroy();

    // Trả về kết quả thành công
    return res.json({ success: true });
  } catch (err) {
    // Lỗi server
    return res.status(500).json({ message: "Server error" });
  }
}

// ======================================================================
// 📦 HÀM 6: LẤY SẢN PHẨM KHUYẾN MÃI
// ======================================================================
async function getPromotionProducts(req, res) {
  try {
    const { limit = 20 } = req.query;
    const products = await Product.findAll({
      where: { is_promotion: true },
      include: [Category],
      limit: Number(limit),
      order: [['createdAt', 'DESC']]
    });
    return res.json(products);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

// ======================================================================
// 📦 HÀM 7: LẤY SẢN PHẨM MỚI VỀ
// ======================================================================
async function getNewProducts(req, res) {
  try {
    const { limit = 20 } = req.query;
    const products = await Product.findAll({
      where: { is_new: true },
      include: [Category],
      limit: Number(limit),
      order: [['createdAt', 'DESC']]
    });
    return res.json(products);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
}

// ======================================================================
// 📦 HÀM 8: LẤY SẢN PHẨM BÁN CHẠY
// ======================================================================
async function getBestsellerProducts(req, res) {
  try {
    const { limit = 20 } = req.query;
    
    // Lấy sản phẩm bán chạy dựa trên tổng số lượng đã bán từ order_details
    const products = await Product.findAll({
      include: [
        Category,
        {
          model: OrderDetail,
          attributes: [],
          required: false
        }
      ],
      attributes: {
        include: [
          [
            sequelize.fn('COALESCE', sequelize.fn('SUM', sequelize.col('OrderDetails.quantity')), 0),
            'total_sold'
          ]
        ]
      },
      group: ['Product.product_id'],
      order: [[sequelize.literal('total_sold'), 'DESC']],
      limit: Number(limit),
      having: sequelize.literal('total_sold > 0')
    });
    
    return res.json(products);
  } catch (err) {
    console.error('Bestseller error:', err);
    // Fallback: lấy sản phẩm mới nhất nếu query phức tạp lỗi
    try {
      const products = await Product.findAll({
        include: [Category],
        limit: Number(req.query.limit || 20),
        order: [['createdAt', 'DESC']]
      });
      return res.json(products);
    } catch (fallbackErr) {
      return res.status(500).json({ message: "Server error" });
    }
  }
}

// ======================================================================
// 🚀 Xuất các hàm ra để dùng trong routes
// ======================================================================
module.exports = {
  listProducts, // Lấy danh sách sản phẩm
  getProduct, // Lấy chi tiết sản phẩm
  createProduct, // Tạo sản phẩm mới
  updateProduct, // Cập nhật sản phẩm
  deleteProduct, // Xóa sản phẩm
  getPromotionProducts, // Lấy sản phẩm khuyến mãi
  getNewProducts, // Lấy sản phẩm mới về
  getBestsellerProducts, // Lấy sản phẩm bán chạy
};
