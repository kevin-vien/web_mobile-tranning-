/**
 * Migration: Thêm trường is_new vào bảng products
 * Mục đích: Đánh dấu sản phẩm mới (1 = true, 0 = false)
 *
 * Chạy script này bằng: node src/migrations/add_is_new_column.js
 */

require("dotenv").config();
const { sequelize } = require("../config/database");

async function addIsNewColumn() {
  try {
    // Kiểm tra kết nối database
    await sequelize.authenticate();
    console.log("Kết nối database thành công");

    // Kiểm tra xem cột is_new đã tồn tại chưa
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'is_new'
    `);

    if (results.length > 0) {
      console.log("Cột is_new đã tồn tại trong bảng products");
      return;
    }

    // Thêm cột is_new nếu chưa tồn tại
    await sequelize.query(`
      ALTER TABLE products 
      ADD COLUMN is_new TINYINT(1) NOT NULL DEFAULT 0 
      COMMENT 'Sản phẩm mới (1 = true, 0 = false)' 
      AFTER is_promotion
    `);

    console.log("Đã thêm cột is_new vào bảng products thành công");

    // Hiển thị cấu trúc bảng để xác nhận
    const [columns] = await sequelize.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'products'
      ORDER BY ORDINAL_POSITION
    `);

    console.log("\nCấu trúc bảng products:");
    columns.forEach((col) => {
      if (col.COLUMN_NAME === "is_new") {
        console.log(
          ` ${col.COLUMN_NAME} (${col.DATA_TYPE}, default: ${
            col.COLUMN_DEFAULT
          }) - ${col.COLUMN_COMMENT || ""}`
        );
      }
    });
  } catch (error) {
    console.error("Lỗi khi thêm cột is_new:", error.message);
    throw error;
  } finally {
    await sequelize.close();
  }
}

// Chạy migration
if (require.main === module) {
  addIsNewColumn()
    .then(() => {
      console.log("\nMigration hoàn tất!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\nMigration thất bại:", error);
      process.exit(1);
    });
}

module.exports = { addIsNewColumn };
