require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize } = require('../config/database');
const { defineModels } = require('../models');

(async () => {
  try {
    await sequelize.authenticate();
    const { User, Category, Product, Banner } = defineModels();

    // Users
    const adminPasswordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin@123', 10);
    await User.findOrCreate({
      where: { email: 'admin@example.com' },
      defaults: { name: 'Admin', email: 'admin@example.com', password: adminPasswordHash, role: 'admin' }
    });

    const userPasswordHash = await bcrypt.hash(process.env.SEED_USER_PASSWORD || 'User@123', 10);
    await User.findOrCreate({
      where: { email: 'user@example.com' },
      defaults: { name: 'User', email: 'user@example.com', password: userPasswordHash, role: 'user' }
    });

    // Categories
    const [phone] = await Category.findOrCreate({ where: { name: 'Điện thoại' }, defaults: { description: 'Smartphones' } });
    const [tablet] = await Category.findOrCreate({ where: { name: 'Tablet' }, defaults: { description: 'Tablets' } });
    const [accessory] = await Category.findOrCreate({ where: { name: 'Phụ kiện' }, defaults: { description: 'Accessories' } });

    // Products
    await Product.findOrCreate({
      where: { name: 'iPhone 15 128GB' },
      defaults: {
        description: 'iPhone 15, màn hình Super Retina XDR, chip A16 Bionic',
        price: 21990000,
        stock: 50,
        brand: 'Apple',
        ram: '6GB',
        storage: '128GB',
        image_url: 'uploads/products/Smart_phones/iphone/iphone_1.webp',
        category_id: phone.category_id
      }
    });

    await Product.findOrCreate({
      where: { name: 'Samsung Galaxy S24 256GB' },
      defaults: {
        description: 'Galaxy S24 với màn hình Dynamic AMOLED 2X',
        price: 18990000,
        stock: 70,
        brand: 'Samsung',
        ram: '8GB',
        storage: '256GB',
        image_url: 'uploads/products/Smart_phones/samsung/samsung_1.webp',
        category_id: phone.category_id
      }
    });

    await Product.findOrCreate({
      where: { name: 'iPad Air M2 10.9-inch Wi‑Fi 128GB' },
      defaults: {
        description: 'iPad Air M2 hiệu năng cao, màn 10.9-inch',
        price: 15990000,
        stock: 30,
        brand: 'Apple',
        ram: '8GB',
        storage: '128GB',
        image_url: 'uploads/products/Laptops/macbook/mac_1.webp',
        category_id: tablet.category_id
      }
    });

    await Product.findOrCreate({
      where: { name: 'Xiaomi Pad 6 8GB/256GB' },
      defaults: {
        description: 'Xiaomi Pad 6 màn 11-inch 144Hz',
        price: 8990000,
        stock: 40,
        brand: 'Xiaomi',
        ram: '8GB',
        storage: '256GB',
        image_url: 'uploads/products/Tables/pc_1.webp',
        category_id: tablet.category_id
      }
    });

    await Product.findOrCreate({
      where: { name: 'Tai nghe Bluetooth AirPods Pro 2' },
      defaults: {
        description: 'Chống ồn chủ động, sạc MagSafe',
        price: 5490000,
        stock: 100,
        brand: 'Apple',
        ram: '-',
        storage: '-',
        image_url: 'uploads/products/Accessories/ariport/blu_1.webp',
        category_id: accessory.category_id
      }
    });

    await Product.findOrCreate({
      where: { name: 'Sạc nhanh Samsung 25W USB-C' },
      defaults: {
        description: 'Sạc nhanh 25W chính hãng Samsung',
        price: 390000,
        stock: 200,
        brand: 'Samsung',
        ram: '-',
        storage: '-',
        image_url: 'uploads/products/Accessories/voice/voice_1.webp',
        category_id: accessory.category_id
      }
    });

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

    console.log('Seed data inserted successfully.');
    process.exit(0);
  } catch (e) {
    console.error('Seed failed:', e.message);
    process.exit(1);
  }
})();


















