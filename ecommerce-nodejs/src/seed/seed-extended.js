require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');
const { defineModels } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    const { User, Category, Product, Banner, Order, OrderDetail, Review } = defineModels();

    // Users (nếu chưa có)
    const adminPasswordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin@123', 10);
    await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: { name: 'Admin', email: 'admin@example.com', password: adminPasswordHash, role: 'admin' }
    });

    const userPasswordHash = await bcrypt.hash(process.env.SEED_USER_PASSWORD || 'User@123', 10);
    const [user] = await User.findOrCreate({
      where: { email: 'user@example.com' },
      defaults: { name: 'User', email: 'user@example.com', password: userPasswordHash, role: 'user' }
    });

    // Categories
    const [phone] = await Category.findOrCreate({ where: { name: 'Điện thoại' }, defaults: { description: 'Smartphones' } });
    const [tablet] = await Category.findOrCreate({ where: { name: 'Tablet' }, defaults: { description: 'Tablets' } });
    const [accessory] = await Category.findOrCreate({ where: { name: 'Phụ kiện' }, defaults: { description: 'Accessories' } });

    // Products
    const products = [
      // iPhone
      { name: 'iPhone 15 128GB', desc: 'iPhone 15, màn hình Super Retina XDR, chip A16 Bionic', price: 21990000, stock: 50, brand: 'Apple', ram: '6GB', storage: '128GB', image: 'uploads/products/Smart_phones/iphone/iphone_1.webp', cat: phone, promo: 0, new: 1 },
      { name: 'iPhone 15 Pro 256GB', desc: 'iPhone 15 Pro với chip A17 Pro, camera 48MP', price: 28990000, stock: 40, brand: 'Apple', ram: '8GB', storage: '256GB', image: 'uploads/products/Smart_phones/iphone/iphone_2.webp', cat: phone, promo: 1, new: 1 },
      { name: 'iPhone 14 128GB', desc: 'iPhone 14 với chip A15 Bionic, camera kép', price: 18990000, stock: 60, brand: 'Apple', ram: '6GB', storage: '128GB', image: 'uploads/products/Smart_phones/iphone/iphone_3.webp', cat: phone, promo: 0, new: 0 },
      { name: 'iPhone 13 256GB', desc: 'iPhone 13 với chip A15, pin lâu', price: 15990000, stock: 45, brand: 'Apple', ram: '4GB', storage: '256GB', image: 'uploads/products/Smart_phones/iphone/iphone_4.webp', cat: phone, promo: 1, new: 0 },
      { name: 'iPhone 12 128GB', desc: 'iPhone 12 với màn hình OLED, 5G', price: 12990000, stock: 35, brand: 'Apple', ram: '4GB', storage: '128GB', image: 'uploads/products/Smart_phones/iphone/iphone_5.webp', cat: phone, promo: 0, new: 0 },
      
      // Samsung
      { name: 'Samsung Galaxy S24 256GB', desc: 'Galaxy S24 với màn hình Dynamic AMOLED 2X', price: 18990000, stock: 70, brand: 'Samsung', ram: '8GB', storage: '256GB', image: 'uploads/products/Smart_phones/samsung/samsung_1.webp', cat: phone, promo: 1, new: 1 },
      { name: 'Samsung Galaxy S23 Ultra 512GB', desc: 'Galaxy S23 Ultra với bút S Pen, camera 200MP', price: 24990000, stock: 50, brand: 'Samsung', ram: '12GB', storage: '512GB', image: 'uploads/products/Smart_phones/samsung/samsung_2.webp', cat: phone, promo: 0, new: 0 },
      { name: 'Samsung Galaxy S22 128GB', desc: 'Galaxy S22 với chip Snapdragon 8 Gen 1', price: 14990000, stock: 60, brand: 'Samsung', ram: '8GB', storage: '128GB', image: 'uploads/products/Smart_phones/samsung/samsung_3.webp', cat: phone, promo: 1, new: 0 },
      { name: 'Samsung Galaxy A54 128GB', desc: 'Galaxy A54 giá rẻ, camera tốt', price: 7990000, stock: 80, brand: 'Samsung', ram: '6GB', storage: '128GB', image: 'uploads/products/Smart_phones/samsung/samsung_4.webp', cat: phone, promo: 0, new: 0 },
      
      // Oppo
      { name: 'Oppo Find X5 Pro', desc: 'Oppo Find X5 Pro với camera Hasselblad', price: 17990000, stock: 40, brand: 'Oppo', ram: '12GB', storage: '256GB', image: 'uploads/products/Smart_phones/oppo/oppo_1.webp', cat: phone, promo: 0, new: 1 },
      { name: 'Oppo Reno 10 Pro', desc: 'Oppo Reno 10 Pro với camera 50MP', price: 12990000, stock: 55, brand: 'Oppo', ram: '8GB', storage: '256GB', image: 'uploads/products/Smart_phones/oppo/oppo_2.webp', cat: phone, promo: 1, new: 0 },
      { name: 'Oppo A78 128GB', desc: 'Oppo A78 giá rẻ, pin 5000mAh', price: 5990000, stock: 70, brand: 'Oppo', ram: '8GB', storage: '128GB', image: 'uploads/products/Smart_phones/oppo/oppo_3.webp', cat: phone, promo: 0, new: 0 },
      
      // Laptops/Tablets
      { name: 'iPad Air M2 10.9-inch Wi‑Fi 128GB', desc: 'iPad Air M2 hiệu năng cao, màn 10.9-inch', price: 15990000, stock: 30, brand: 'Apple', ram: '8GB', storage: '128GB', image: 'uploads/products/Laptops/macbook/mac_1.webp', cat: tablet, promo: 0, new: 1 },
      { name: 'MacBook Pro 14 inch M3', desc: 'MacBook Pro 14 inch với chip M3', price: 45990000, stock: 25, brand: 'Apple', ram: '18GB', storage: '512GB', image: 'uploads/products/Laptops/macbook/mac_2.webp', cat: tablet, promo: 0, new: 1 },
      { name: 'MacBook Air M2 13 inch', desc: 'MacBook Air M2 siêu mỏng nhẹ', price: 29990000, stock: 40, brand: 'Apple', ram: '8GB', storage: '256GB', image: 'uploads/products/Laptops/macbook/mac_3.webp', cat: tablet, promo: 1, new: 0 },
      { name: 'Asus ROG Strix G16', desc: 'Asus ROG gaming laptop RTX 4060', price: 32990000, stock: 30, brand: 'Asus', ram: '16GB', storage: '512GB', image: 'uploads/products/Laptops/asus/asus_1.webp', cat: tablet, promo: 0, new: 1 },
      { name: 'Dell XPS 13 Plus', desc: 'Dell XPS 13 Plus cao cấp', price: 34990000, stock: 25, brand: 'Dell', ram: '16GB', storage: '512GB', image: 'uploads/products/Laptops/dell/dell_1.webp', cat: tablet, promo: 0, new: 1 },
      { name: 'Lenovo ThinkPad X1 Carbon', desc: 'Lenovo ThinkPad doanh nhân', price: 32990000, stock: 25, brand: 'Lenovo', ram: '16GB', storage: '512GB', image: 'uploads/products/Laptops/lenovo/lenovo_1.webp', cat: tablet, promo: 0, new: 1 },
      { name: 'Xiaomi Pad 6 8GB/256GB', desc: 'Xiaomi Pad 6 màn 11-inch 144Hz', price: 8990000, stock: 40, brand: 'Xiaomi', ram: '8GB', storage: '256GB', image: 'uploads/products/Tables/pc_1.webp', cat: tablet, promo: 0, new: 0 },
      
      // Accessories
      { name: 'Tai nghe Bluetooth AirPods Pro 2', desc: 'Chống ồn chủ động, sạc MagSafe', price: 5490000, stock: 100, brand: 'Apple', ram: '-', storage: '-', image: 'uploads/products/Accessories/ariport/blu_1.webp', cat: accessory, promo: 1, new: 0 },
      { name: 'AirPods Max', desc: 'Tai nghe over-ear cao cấp', price: 12990000, stock: 50, brand: 'Apple', ram: '-', storage: '-', image: 'uploads/products/Accessories/ariport/blu_2.webp', cat: accessory, promo: 0, new: 1 },
      { name: 'Sạc nhanh Samsung 25W USB-C', desc: 'Sạc nhanh 25W chính hãng Samsung', price: 390000, stock: 200, brand: 'Samsung', ram: '-', storage: '-', image: 'uploads/products/Accessories/voice/voice_1.webp', cat: accessory, promo: 0, new: 0 },
      { name: 'Sạc không dây MagSafe', desc: 'Sạc không dây cho iPhone', price: 1990000, stock: 150, brand: 'Apple', ram: '-', storage: '-', image: 'uploads/products/Accessories/voice/voice_2.webp', cat: accessory, promo: 1, new: 0 },
    ];

    for (const p of products) {
      await Product.findOrCreate({
        where: { name: p.name },
        defaults: {
          description: p.desc,
          price: p.price,
          stock: p.stock,
          brand: p.brand,
          ram: p.ram,
          storage: p.storage,
          image_url: p.image,
          category_id: p.cat.category_id,
          is_promotion: p.promo,
          is_new: p.new
        }
      });
    }

    // Banners
    await Banner.findOrCreate({
      where: { title: 'Giảm giá cuối tuần' },
      defaults: {
        image_url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=1600&auto=format&fit=crop',
        link: '#'
      }
    });
    await Banner.findOrCreate({
      where: { title: 'Deal hot điện thoại' },
      defaults: {
        image_url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=1600&auto=format&fit=crop',
        link: '#'
      }
    });

    // Orders và Order Details (nếu user tồn tại)
    if (user) {
      const [order1] = await Order.findOrCreate({
        where: { order_id: 1 },
        defaults: {
          user_id: user.user_id,
          total_price: 21990000,
          payment_method: 'COD',
          status: 'done'
        }
      });

      if (order1) {
        const product1 = await Product.findOne({ where: { name: 'iPhone 15 128GB' } });
        if (product1) {
          await OrderDetail.findOrCreate({
            where: { order_detail_id: 1 },
            defaults: {
              order_id: order1.order_id,
              product_id: product1.product_id,
              quantity: 1,
              price: 21990000
            }
          });
        }
      }

      // Reviews
      const product1 = await Product.findOne({ where: { name: 'iPhone 15 128GB' } });
      if (product1) {
        await Review.findOrCreate({
          where: { review_id: 1 },
          defaults: {
            product_id: product1.product_id,
            user_id: user.user_id,
            rating: 5,
            comment: 'Sản phẩm tuyệt vời, màn hình đẹp, hiệu năng mạnh mẽ!'
          }
        });
      }
    }

    console.log('Extended seed data inserted successfully.');
    process.exit(0);
  } catch (e) {
    console.error('Seed failed:', e.message);
    process.exit(1);
  }
})();

