// const { Sequelize } = require('sequelize');

// const sequelize = new Sequelize(
//   process.env.DB_NAME || 'web_mobile',
//   process.env.DB_USER || 'root',
//   process.env.DB_PASSWORD || '',
//   {
//     host: process.env.DB_HOST || 'localhost',
//     port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
//     dialect: 'mysql',
//     logging: false,
//     define: {
//       underscored: true
//     }
//   }
// );

// async function testConnection() {
//   try {
//     await sequelize.authenticate();
//     console.log('Database connection has been established successfully.');
//   } catch (error) {
//     console.error('Unable to connect to the database:', error.message);
//   }
// }

// module.exports = { sequelize, testConnection };

// import lớp Sequelize từ package 'sequelize'
const { Sequelize } = require("sequelize");

// tạo một instance Sequelize (đại diện cho kết nối/ORM)
const sequelize = new Sequelize(
  // tên database (lấy từ biến môi trường DB_NAME, nếu không có thì dùng 'web_mobile')
  process.env.DB_NAME || "web_mobile",
  // username DB (DB_USER || 'root')
  process.env.DB_USER || "root",
  // password DB (DB_PASSWORD || '')
  process.env.DB_PASSWORD || "",
  {
    // cấu hình kết nối:
    // host DB (DB_HOST || 'localhost')
    host: process.env.DB_HOST || "localhost",
    // port DB: nếu có DB_PORT thì chuyển thành Number, ngược lại dùng 3306
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    // loại DB (MySQL)
    dialect: "mysql",
    // tắt logging câu SQL (mặc định Sequelize in SQL ra console)
    logging: false,
    // thiết lập mặc định cho model/definition
    define: {
      underscored: true,
    },
  }
);

// hàm kiểm tra kết nối DB
async function testConnection() {
  try {
    // authenticate() thử kết nối và trả về Promise
    await sequelize.authenticate();
    console.log("Database connection has been established successfully.");
  } catch (error) {
    // in ra lỗi (ở đây lấy error.message)
    console.error("Unable to connect to the database:", error.message);
  }
}

// xuất (export) sequelize và testConnection để module khác dùng
module.exports = { sequelize, testConnection };
