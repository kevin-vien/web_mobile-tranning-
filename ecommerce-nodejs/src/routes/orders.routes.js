// Import thư viện Express để tạo router
const express = require("express");

// Import middleware authentication từ file auth.js
// authenticate: Kiểm tra user đã đăng nhập chưa (có token hợp lệ không)
// authorizeAdmin: Kiểm tra user có quyền admin không (chỉ admin mới được truy cập)
const { authenticate, authorizeAdmin } = require("../middleware/auth");

// Import hàm defineModels để lấy các model (Order, OrderDetail, Product, v.v.)
// defineModels() trả về object chứa tất cả các model đã được định nghĩa
const { defineModels } = require("../models");

// Import thư viện nodemailer để gửi email
// nodemailer là thư viện phổ biến để gửi email trong Node.js
const nodemailer = require("nodemailer");

// Import sequelize instance từ file database.js
// sequelize dùng để quản lý database transactions (đảm bảo tính toàn vẹn dữ liệu)
const { sequelize } = require("../config/database");

// Gọi defineModels() để lấy các model cần dùng
// Destructuring để lấy ra Order, OrderDetail, Product từ kết quả trả về
const { Order, OrderDetail, Product } = defineModels();

// Tạo Express Router instance cho orders routes
const router = express.Router();

// function buildTransport() {
//   const host = process.env.SMTP_HOST;
//   const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
//   const user = process.env.SMTP_USER;
//   const pass = process.env.SMTP_PASS;
//   if (!host || !user || !pass) return null;
//   return nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
// }
// Hàm tạo email transporter (SMTP client) để gửi email
// Transporter là object dùng để kết nối và gửi email qua SMTP server
function buildTransport() {
  // Lấy thông tin SMTP server từ biến môi trường
  // SMTP_HOST: Địa chỉ SMTP server (ví dụ: smtp.gmail.com)
  const host = process.env.SMTP_HOST;
  
  // Lấy port SMTP, nếu không có thì dùng 587 (port mặc định cho TLS)
  // Number() chuyển string thành number
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  
  // Lấy username và password để đăng nhập SMTP server
  const user = process.env.SMTP_USER; // Email đăng nhập
  const pass = process.env.SMTP_PASS; // Mật khẩu hoặc app password
  
  // Nếu thiếu bất kỳ thông tin nào → không thể tạo transporter → return null
  if (!host || !user || !pass) return null;
  
  // Kiểm tra port có phải là 465 không (port cho SSL/TLS)
  // Port 465 dùng secure connection (SSL), port 587 dùng STARTTLS
  const isSecure = port === 465;
  
  // Cấu hình cho nodemailer transporter
  const config = {
    host,        // Địa chỉ SMTP server
    port,        // Port SMTP server
    secure: isSecure, // true nếu port 465 (SSL), false nếu port 587 (STARTTLS)
    auth: { user, pass }, // Thông tin đăng nhập SMTP
    
    // Timeout options: Giới hạn thời gian chờ kết nối
    connectionTimeout: 10000, // 10 giây: Thời gian chờ kết nối đến SMTP server
    greetingTimeout: 10000,   // 10 giây: Thời gian chờ SMTP server gửi greeting message
    socketTimeout: 10000,     // 10 giây: Thời gian chờ response từ SMTP server
    
    // Yêu cầu nâng cấp kết nối lên TLS (cho port 587)
    // requireTLS: true → bắt buộc phải dùng TLS, false → có thể dùng plain text
    requireTLS: !isSecure && port === 587,
    
    // Cấu hình TLS/SSL
    tls: {
      // rejectUnauthorized: false → chấp nhận certificate tự ký (cho development)
      // true → chỉ chấp nhận certificate hợp lệ từ CA (cho production)
      rejectUnauthorized: false,
      // Ciphers: Thuật toán mã hóa (SSLv3 là cũ, nhưng một số server yêu cầu)
      ciphers: 'SSLv3'
    }
  };
  
  // Tạo transporter với cấu hình đã định nghĩa
  try {
    // createTransport() tạo SMTP transporter với config
    return nodemailer.createTransport(config);
  } catch (e) {
    // Nếu có lỗi khi tạo transporter (config sai, v.v.)
    // In lỗi ra console và return null
    console.error('Failed to create email transporter:', e.message);
    return null;
  }
}

// Hàm format số tiền theo định dạng Việt Nam
// Ví dụ: 1000000 → "1.000.000 đ"
function formatCurrency(v) {
  try {
    // Number(v): Chuyển giá trị thành number
    // toLocaleString("vi-VN"): Format số theo định dạng Việt Nam (dấu chấm ngăn cách hàng nghìn)
    // + " đ": Thêm đơn vị tiền tệ "đ" vào cuối
    return Number(v).toLocaleString("vi-VN") + " đ";
  } catch {
    // Nếu có lỗi (v không phải số), chuyển thành string và trả về
    return String(v);
  }
}

// Hàm tạo HTML email xác nhận đơn hàng
// order: Object chứa thông tin đơn hàng (order_id, total_price, payment_method, v.v.)
// items: Mảng chứa các sản phẩm trong đơn hàng [{product_id, quantity, price}, ...]
function buildOrderEmailHtml(order, items) {
  // Tạo các dòng trong bảng sản phẩm
  // map(): Duyệt qua từng item và tạo HTML row cho mỗi item
  const rows = items
    .map((it) => {
      // Tính thành tiền cho mỗi sản phẩm = giá × số lượng
      // Number(it.price) || 0: Chuyển price thành number, nếu không phải số thì dùng 0
      // Number(it.quantity) || 1: Chuyển quantity thành number, nếu không phải số thì dùng 1
      const lineTotal = (Number(it.price) || 0) * (Number(it.quantity) || 1);
      
      // Tạo HTML row cho sản phẩm
      // Template string `${...}` để chèn giá trị vào HTML
      return `<tr><td style="padding:6px 8px;border:1px solid #ddd;">${
        it.product_id  // ID sản phẩm
      }</td><td style="padding:6px 8px;border:1px solid #ddd;">${
        it.quantity    // Số lượng
      }</td><td style="padding:6px 8px;border:1px solid #ddd;">${formatCurrency(
        it.price      // Giá (đã format)
      )}</td><td style="padding:6px 8px;border:1px solid #ddd;">${formatCurrency(
        lineTotal     // Thành tiền (đã format)
      )}</td></tr>`;
    })
    .join(""); // join(""): Nối tất cả các row thành một string HTML
  
  // Trả về HTML email hoàn chỉnh
  // Inline CSS để email hiển thị đúng trên các email client
  return `
    <div style="font-family:Arial,sans-serif;font-size:14px;color:#111">
      <h2 style="font-size:18px">Đặt hàng thành công</h2>
      <p>Mã đơn: <strong>${order.order_id}</strong></p>
      <p>Phương thức: <strong>${order.payment_method}</strong></p>
      <table style="border-collapse:collapse;border:1px solid #ddd">
        <thead>
          <tr>
            <th style="padding:6px 8px;border:1px solid #ddd;">Sản phẩm (ID)</th>
            <th style="padding:6px 8px;border:1px solid #ddd;">SL</th>
            <th style="padding:6px 8px;border:1px solid #ddd;">Giá</th>
            <th style="padding:6px 8px;border:1px solid #ddd;">Thành tiền</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding:6px 8px;border:1px solid #ddd;text-align:right"><strong>Tổng</strong></td>
            <td style="padding:6px 8px;border:1px solid #ddd;"><strong>${formatCurrency(
              order.total_price  // Tổng tiền đơn hàng (đã format)
            )}</strong></td>
          </tr>
        </tfoot>
      </table>
      <p style="margin-top:10px">Cảm ơn bạn đã mua sắm tại Web Mobile!</p>
    </div>`;
}

// Route POST /api/orders: Tạo đơn hàng mới
// authenticate: Middleware kiểm tra user đã đăng nhập (có token hợp lệ)
// async: Hàm bất đồng bộ vì cần tương tác với database
router.post("/", authenticate, async (req, res) => {
  // Bắt đầu database transaction
  // Transaction đảm bảo tính toàn vẹn dữ liệu: tất cả thao tác thành công hoặc tất cả rollback
  // Nếu có lỗi ở bất kỳ bước nào → rollback tất cả thay đổi
  const t = await sequelize.transaction();
  
  try {
    // Lấy dữ liệu từ request body
    // items: Mảng các sản phẩm trong đơn [{product_id, quantity, price}, ...]
    // payment_method: Phương thức thanh toán ('COD' hoặc 'ONLINE')
    const { items, payment_method } = req.body;
    
    // Kiểm tra items có hợp lệ không
    // Nếu không phải array hoặc array rỗng → trả lỗi 400 Bad Request
    if (!Array.isArray(items) || items.length === 0) {
      await t.rollback(); // Hủy transaction
      return res.status(400).json({ message: "No items" });
    }

    // Chuẩn hóa và validate dữ liệu đầu vào
    // map(): Duyệt qua từng item và chuyển đổi sang định dạng chuẩn
    const normalized = items.map((it) => ({
      product_id: Number(it.product_id),           // Chuyển product_id thành number
      quantity: Math.max(1, Number(it.quantity) || 0), // Số lượng tối thiểu là 1
      price: Number(it.price),                     // Chuyển price thành number
    }));

    // Kiểm tra tồn kho và khóa hàng (row-level lock)
    // Duyệt qua từng sản phẩm trong đơn hàng
    for (const it of normalized) {
      // Tìm sản phẩm theo ID và khóa hàng (SELECT FOR UPDATE)
      // lock: t.LOCK.UPDATE → khóa hàng để tránh race condition (2 người cùng mua 1 sản phẩm)
      // transaction: t → thao tác trong transaction
      const product = await Product.findByPk(it.product_id, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      
      // Nếu không tìm thấy sản phẩm → rollback và trả lỗi
      if (!product) {
        await t.rollback();
        return res
          .status(400)
          .json({ message: "Product not found", product_id: it.product_id });
      }
      
      // Lấy số lượng tồn kho hiện tại
      const currentStock = Number(product.stock) || 0;
      
      // Kiểm tra tồn kho có đủ không
      // Nếu không đủ → rollback và trả lỗi 409 Conflict
      if (currentStock < it.quantity) {
        await t.rollback();
        return res
          .status(409)
          .json({
            message: "Insufficient stock",
            product_id: it.product_id,
            available: currentStock,    // Số lượng có sẵn
            requested: it.quantity,     // Số lượng yêu cầu
          });
      }
      
      // Cập nhật số lượng tồn kho: trừ đi số lượng đã đặt
      // update() trong transaction → chỉ commit khi transaction commit
      await product.update(
        { stock: currentStock - it.quantity },
        { transaction: t }
      );
    }

    // Tính tổng tiền đơn hàng
    // reduce(): Duyệt qua tất cả items và tính tổng (giá × số lượng)
    // s: accumulator (tổng tích lũy), it: item hiện tại
    const total = normalized.reduce(
      (s, it) => s + Number(it.price) * Number(it.quantity),
      0  // Giá trị khởi tạo = 0
    );
    
    // Tạo đơn hàng mới trong database
    // user_id: Lấy từ req.user (đã được authenticate middleware set)
    // total_price: Tổng tiền đã tính
    // payment_method: Phương thức thanh toán
    // transaction: t → tạo trong transaction
    const order = await Order.create(
      { user_id: req.user.user_id, total_price: total, payment_method },
      { transaction: t }
    );
    
    // Tạo các order details (chi tiết đơn hàng) cho từng sản phẩm
    for (const it of normalized) {
      await OrderDetail.create(
        {
          order_id: order.order_id,    // ID đơn hàng vừa tạo
          product_id: it.product_id,   // ID sản phẩm
          quantity: it.quantity,       // Số lượng
          price: it.price,             // Giá tại thời điểm đặt hàng
        },
        { transaction: t }  // Tạo trong transaction
      );
    }

    // Commit transaction: Xác nhận tất cả thay đổi vào database
    // Chỉ khi commit thành công thì dữ liệu mới được lưu
    await t.commit();

    // Gửi email xác nhận đơn hàng (best-effort: cố gắng gửi, nhưng không làm crash nếu lỗi)
    // Gửi sau khi commit để đảm bảo đơn hàng đã được lưu
    try {
      // Tạo email transporter
      const transporter = buildTransport();
      
      // Email người nhận: email của user đặt hàng
      const to = req.user.email;
      
      // Email người gửi: lấy từ biến môi trường SMTP_FROM hoặc SMTP_USER
      const from = process.env.SMTP_FROM || process.env.SMTP_USER;
      
      // Chỉ gửi email nếu có đủ thông tin
      if (transporter && to && from) {
        // Kiểm tra kết nối SMTP trước khi gửi
        await transporter.verify();
        
        // Gửi email
        await transporter.sendMail({
          from,      // Email người gửi
          to,        // Email người nhận
          subject: `Xác nhận đơn hàng #${order.order_id}`, // Tiêu đề email
          html: buildOrderEmailHtml(order, normalized),   // Nội dung email (HTML)
        });
      }
    } catch (e) {
      // Nếu gửi email lỗi → chỉ in ra console, không làm crash
      console.error("Send order email failed:", e.message);
      
      // In thêm thông tin lỗi từ SMTP server (nếu có)
      if (e.response) {
        console.error("SMTP response:", e.response);
      }
    }

    // Trả về đơn hàng vừa tạo với HTTP status 201 Created
    return res.status(201).json(order);
  } catch (err) {
    // Nếu có lỗi bất kỳ → rollback transaction
    try {
      await t.rollback(); // Hủy tất cả thay đổi
    } catch {}
    
    // Trả lỗi 500 Internal Server Error
    return res.status(500).json({ message: "Server error" });
  }
});

// Route GET /api/orders/:id: Lấy chi tiết một đơn hàng theo ID
// authenticate: Phải đăng nhập mới xem được đơn hàng
// :id là ID của đơn hàng cần xem
router.get("/:id", authenticate, async (req, res) => {
  try {
    // Tìm đơn hàng theo ID và include các thông tin liên quan
    // include: Join với bảng OrderDetail và Product để lấy thông tin chi tiết
    // [{ model: OrderDetail, include: [Product] }]: Lấy OrderDetail và Product trong mỗi OrderDetail
    const order = await Order.findByPk(req.params.id, {
      include: [{ model: OrderDetail, include: [Product] }],
    });
    
    // Nếu không tìm thấy đơn hàng → trả lỗi 404 Not Found
    if (!order) return res.status(404).json({ message: "Not found" });
    
    // Kiểm tra quyền truy cập:
    // - Admin có thể xem tất cả đơn hàng
    // - User chỉ có thể xem đơn hàng của chính mình
    if (req.user.role !== "admin" && order.user_id !== req.user.user_id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Trả về thông tin đơn hàng (bao gồm chi tiết và sản phẩm)
    return res.json(order);
  } catch (err) {
    // Nếu có lỗi → trả lỗi 500 Internal Server Error
    return res.status(500).json({ message: "Server error" });
  }
});

// Route GET /api/orders/user/:id: Lấy danh sách đơn hàng của một user
// authenticate: Phải đăng nhập
// :id là ID của user cần xem đơn hàng
router.get("/user/:id", authenticate, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const requestUserId = req.user.user_id;
    
    console.log('GET /api/orders/user/:id - Requested user ID:', userId, 'Request user ID:', requestUserId);
    
    // Kiểm tra quyền truy cập:
    // - Admin có thể xem đơn hàng của bất kỳ user nào
    // - User chỉ có thể xem đơn hàng của chính mình
    if (req.user.role !== "admin" && userId !== requestUserId) {
      console.log('Access denied: User', requestUserId, 'trying to access orders for user', userId);
      return res.status(403).json({ message: "Forbidden" });
    }
    
    // Validate user_id
    if (!userId || isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    // Tìm tất cả đơn hàng của user có user_id = req.params.id
    // include: Join với OrderDetail và Product để lấy thông tin chi tiết
    console.log('Querying orders for user_id:', userId);
    
    const orders = await Order.findAll({
      where: { 
        user_id: userId  // Lọc theo user_id
      },
      include: [{ 
        model: OrderDetail, 
        required: false,  // LEFT JOIN để lấy cả đơn hàng không có chi tiết
        include: [{
          model: Product,
          required: false  // LEFT JOIN để lấy cả order detail không có product (nếu product đã bị xóa)
        }]
      }],
      order: [['order_id', 'DESC']]  // Sắp xếp theo order_id mới nhất
    });
    
    console.log('Found', orders.length, 'orders for user', userId);
    
    // Serialize dữ liệu để tránh lỗi khi trả về JSON
    // Sequelize tự động serialize, nhưng cần convert DECIMAL và xử lý null
    const ordersData = orders.map(order => {
      const orderJson = order.toJSON();
      
      // Convert DECIMAL to Number for total_price
      if (orderJson.total_price != null) {
        orderJson.total_price = parseFloat(orderJson.total_price) || 0;
      }
      
      // Serialize OrderDetails nếu có
      if (orderJson.OrderDetails && Array.isArray(orderJson.OrderDetails)) {
        orderJson.OrderDetails = orderJson.OrderDetails.map(detail => {
          const detailJson = detail.toJSON ? detail.toJSON() : detail;
          
          // Convert DECIMAL to Number for price
          if (detailJson.price != null) {
            detailJson.price = parseFloat(detailJson.price) || 0;
          }
          
          // Convert quantity to Number
          if (detailJson.quantity != null) {
            detailJson.quantity = parseInt(detailJson.quantity) || 1;
          }
          
          // Serialize Product nếu có
          if (detailJson.Product) {
            detailJson.Product = detailJson.Product.toJSON ? detailJson.Product.toJSON() : detailJson.Product;
          } else {
            // Nếu Product null, tạo object rỗng
            detailJson.Product = {
              product_id: detailJson.product_id,
              name: 'Sản phẩm không tồn tại',
              image_url: null
            };
          }
          
          return detailJson;
        });
      } else {
        orderJson.OrderDetails = [];
      }
      
      return orderJson;
    });
    
    console.log('Serialized', ordersData.length, 'orders successfully');
    
    // Trả về danh sách đơn hàng
    return res.json(ordersData);
  } catch (err) {
    // Log lỗi để debug
    console.error('Error in /api/orders/user/:id:', err);
    // Nếu có lỗi → trả lỗi 500 Internal Server Error
    return res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Route PUT /api/orders/:id: Cập nhật trạng thái đơn hàng (CHỈ ADMIN)
// authenticate: Phải đăng nhập
// authorizeAdmin: Phải là admin
// :id là ID của đơn hàng cần cập nhật
router.put("/:id", authenticate, authorizeAdmin, async (req, res) => {
  try {
    // Tìm đơn hàng theo ID
    const order = await Order.findByPk(req.params.id);
    
    // Nếu không tìm thấy đơn hàng → trả lỗi 404 Not Found
    if (!order) return res.status(404).json({ message: "Not found" });
    
    // Cập nhật trạng thái đơn hàng
    // req.body.status: Trạng thái mới ('pending', 'shipped', 'done', 'cancel')
    await order.update({ status: req.body.status });
    
    // Trả về đơn hàng sau khi cập nhật
    return res.json(order);
  } catch (err) {
    // Nếu có lỗi (dữ liệu không hợp lệ, v.v.) → trả lỗi 400 Bad Request
    return res.status(400).json({ message: "Invalid data" });
  }
});

module.exports = router;
