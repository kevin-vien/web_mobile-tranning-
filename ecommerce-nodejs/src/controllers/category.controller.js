// const { defineModels } = require('../models');
// const { Category } = defineModels();

// async function listCategories(req, res) {
//   try {
//     const categories = await Category.findAll();
//     return res.json(categories);
//   } catch (err) {
//     return res.status(500).json({ message: 'Server error' });
//   }
// }

// async function createCategory(req, res) {
//   try {
//     const category = await Category.create(req.body);
//     return res.status(201).json(category);
//   } catch (err) {
//     return res.status(400).json({ message: 'Invalid data' });
//   }
// }

// async function updateCategory(req, res) {
//   try {
//     const category = await Category.findByPk(req.params.id);
//     if (!category) return res.status(404).json({ message: 'Not found' });
//     await category.update(req.body);
//     return res.json(category);
//   } catch (err) {
//     return res.status(400).json({ message: 'Invalid data' });
//   }
// }

// async function deleteCategory(req, res) {
//   try {
//     const category = await Category.findByPk(req.params.id);
//     if (!category) return res.status(404).json({ message: 'Not found' });
//     await category.destroy();
//     return res.json({ success: true });
//   } catch (err) {
//     return res.status(500).json({ message: 'Server error' });
//   }
// }

// module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
// Import hàm defineModels từ thư mục models
const { defineModels } = require("../models");

// Gọi hàm defineModels() để lấy các model (bảng) đã định nghĩa,
// sau đó trích xuất model Category ra để sử dụng
const { Category } = defineModels();

// =======================
// 1️⃣ Lấy danh sách danh mục
// =======================
async function listCategories(req, res) {
  try {
    // Dùng Sequelize để lấy toàn bộ dữ liệu từ bảng Category
    const categories = await Category.findAll();

    // Trả danh sách dưới dạng JSON cho client
    return res.json(categories);
  } catch (err) {
    // Nếu có lỗi server, trả về mã lỗi 500
    return res.status(500).json({ message: "Server error" });
  }
}

// =======================
// 2️⃣ Tạo mới một danh mục
// =======================
async function createCategory(req, res) {
  try {
    // Tạo một bản ghi mới trong bảng Category với dữ liệu từ req.body
    const category = await Category.create(req.body);

    // Trả về dữ liệu danh mục mới cùng mã trạng thái 201 (Created)
    return res.status(201).json(category);
  } catch (err) {
    // Nếu dữ liệu không hợp lệ, trả về mã lỗi 400
    return res.status(400).json({ message: "Invalid data" });
  }
}

// =======================
// 3️⃣ Cập nhật danh mục theo ID
// =======================
async function updateCategory(req, res) {
  try {
    // Tìm danh mục theo khóa chính (id) trong URL: /categories/:id
    const category = await Category.findByPk(req.params.id);

    // Nếu không tìm thấy danh mục, trả về lỗi 404
    if (!category) return res.status(404).json({ message: "Not found" });

    // Cập nhật danh mục bằng dữ liệu trong req.body
    await category.update(req.body);

    // Trả về danh mục sau khi cập nhật
    return res.json(category);
  } catch (err) {
    // Nếu dữ liệu không hợp lệ hoặc có lỗi khác
    return res.status(400).json({ message: "Invalid data" });
  }
}

// =======================
// 4️⃣ Xóa danh mục theo ID
// =======================
async function deleteCategory(req, res) {
  try {
    // Tìm danh mục cần xóa theo id
    const category = await Category.findByPk(req.params.id);

    // Nếu không tìm thấy danh mục, trả về lỗi 404
    if (!category) return res.status(404).json({ message: "Not found" });

    // Xóa danh mục khỏi cơ sở dữ liệu
    await category.destroy();

    // Trả về thông báo thành công
    return res.json({ success: true });
  } catch (err) {
    // Nếu có lỗi server, trả về mã lỗi 500
    return res.status(500).json({ message: "Server error" });
  }
}

// =======================
// 5️⃣ Xuất các hàm để dùng ở nơi khác (routes, app.js,...)
// =======================
module.exports = {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};



