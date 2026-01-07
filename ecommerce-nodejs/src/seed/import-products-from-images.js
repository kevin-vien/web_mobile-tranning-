require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');
const { defineModels } = require('../models');

function toTitleCase(input) {
	return String(input || '')
		.replace(/[-_]+/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase()
		.replace(/(^|\s)\S/g, (t) => t.toUpperCase());
}

async function ensureCategory(models, categoryName) {
	const name = toTitleCase(categoryName);
	const [category] = await models.Category.findOrCreate({
		where: { name },
		defaults: { description: `${name}` }
	});
	return category;
}

function pickDefaultsByCategory(categoryName) {
	const k = (categoryName || '').toLowerCase();
	if (k.includes('phone') || k.includes('smart')) {
		return { price: 9990000, ram: '8GB', storage: '128GB' };
	}
	if (k.includes('laptop')) {
		return { price: 19990000, ram: '16GB', storage: '512GB' };
	}
	if (k.includes('tablet') || k.includes('table')) {
		return { price: 7900000, ram: '8GB', storage: '128GB' };
	}
	if (k.includes('accessor')) {
		return { price: 390000, ram: '-', storage: '-' };
	}
	return { price: 990000, ram: '-', storage: '-' };
}

async function main() {
	const { Product, Category } = defineModels();
	const baseDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'products');
	if (!fs.existsSync(baseDir)) {
		console.error('Directory not found:', baseDir);
		process.exit(1);
	}

	const walk = (dir) => {
		const out = [];
		for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
			const full = path.join(dir, entry.name);
			if (entry.isDirectory()) out.push(...walk(full));
			else out.push(full);
		}
		return out;
	};

	const files = walk(baseDir).filter((f) => /\.(png|jpe?g|webp|gif)$/i.test(f));
	console.log('Found image files:', files.length);

	let created = 0;
	let skipped = 0;

	for (const file of files) {
		// Example: public/uploads/products/Smart_phones/iphone/iphone_1.webp
		const relFromRepo = path
			.relative(path.join(__dirname, '..', '..'), file)
			.replace(/\\/g, '/');
		const segments = relFromRepo.split('/');
		// [ 'public','uploads','products', '<Category>', '<Brand?>', '<file>' ]
		const categoryRaw = segments[3] || 'Misc';
		const brandRaw = segments.length >= 6 ? segments[4] : null;
		const fileName = segments[segments.length - 1];
		const nameNoExt = fileName.replace(/\.[^.]+$/, '');

		const category = await ensureCategory({ Category }, categoryRaw);
		const brand = brandRaw ? toTitleCase(brandRaw) : 'Generic';

		const prettyBase = toTitleCase(nameNoExt);
		let productName = prettyBase;
		if (brand && !prettyBase.toLowerCase().startsWith(brand.toLowerCase())) {
			productName = `${brand} ${prettyBase}`;
		}

		const { price, ram, storage } = pickDefaultsByCategory(categoryRaw);

		const [product, wasCreated] = await Product.findOrCreate({
			where: { name: productName },
			defaults: {
				description: `Auto imported from images (${productName}).`,
				price,
				stock: 20,
				brand,
				ram,
				storage,
				image_url: relFromRepo, // stored with leading 'public/...'
				category_id: category.category_id
			}
		});

		if (!wasCreated) {
			// If already exists, update image_url if empty
			if (!product.image_url) {
				await product.update({ image_url: relFromRepo });
			}
			skipped++;
		} else {
			created++;
		}
	}

	console.log(`Done. Created: ${created}, Skipped(existing): ${skipped}`);
	await sequelize.close();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});















