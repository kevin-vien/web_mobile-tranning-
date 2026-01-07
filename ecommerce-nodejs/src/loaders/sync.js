// const { sequelize } = require('../config/database');
// const { defineModels } = require('../models');

// async function syncDatabase() {
//   const models = defineModels();
//   await sequelize.sync({ alter: true });
//   return models;
// }

// module.exports = { syncDatabase };
// 🧩 Import đối tượng sequelize đã cấu hình kết nối đến cơ sở dữ liệu
const { sequelize } = require("../config/database");

// 🧩 Import hàm defineModels() — nơi định nghĩa các bảng (model)
const { defineModels } = require("../models");

// ======================================================================
// ⚙️ HÀM: Đồng bộ cấu trúc cơ sở dữ liệu
// ======================================================================
async function syncDatabase() {
  // Gọi hàm defineModels() để đăng ký tất cả các model vào Sequelize
  const models = defineModels();

  // 🧠 sequelize.sync():
  // - Kiểm tra xem các bảng tương ứng với model đã tồn tại chưa
  // - Nếu chưa, Sequelize sẽ tự tạo mới
  // - Nếu có rồi, tùy tùy chọn mà nó có thể sửa đổi (thêm, cập nhật cột, v.v.)

  // ⚙️ { alter: true }:
  // - Sequelize sẽ tự động cập nhật (ALTER TABLE) các bảng để khớp với model mới nhất
  // - Cực kỳ hữu ích khi bạn thay đổi cấu trúc model mà không muốn xóa dữ liệu cũ
  // - ⚠️ Tuy nhiên, chỉ nên dùng trong môi trường phát triển (development)
  // - Index creation is disabled in associations to avoid "Too many keys" error
  //   (MySQL/MariaDB has a limit of 64 keys per table)

  await sequelize.sync({ alter: true });

  // Trả lại danh sách models (Product, Category, User, v.v.)
  return models;
}

// ======================================================================
// 🚀 Export hàm syncDatabase ra để có thể gọi ở nơi khác (vd: server.js)
// ======================================================================
module.exports = { syncDatabase };
