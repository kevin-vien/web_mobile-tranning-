/*
  Scan public/uploads/products and set products.image_url = 'public/uploads/products/...'
  Matching rule: filename without extension should match product name (case-insensitive) OR include product_id prefix like <id>-<name>.*
*/
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../config/database');
const { defineModels } = require('../models');

function normalizeName(s){
  return String(s || '')
    .toLowerCase()
    .normalize('NFD').replace(/\p{Diacritic}/gu,'')
    .replace(/[^a-z0-9]+/g,'')
    .trim();
}

async function main(){
  const { Product } = defineModels();
  const baseDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'products');
  if(!fs.existsSync(baseDir)){
    console.error('Directory not found:', baseDir);
    process.exit(1);
  }

  const walk = (dir) => {
    const out = [];
    for(const entry of fs.readdirSync(dir, { withFileTypes: true })){
      const full = path.join(dir, entry.name);
      if(entry.isDirectory()) out.push(...walk(full));
      else out.push(full);
    }
    return out;
  };

  const files = walk(baseDir).filter(f => /\.(png|jpe?g|webp|gif)$/i.test(f));
  console.log('Found files:', files.length);

  // Cache products
  const products = await Product.findAll();
  const idMap = new Map();
  const nameMap = new Map();
  for(const p of products){
    idMap.set(String(p.product_id), p);
    nameMap.set(normalizeName(p.name), p);
  }

  let updated = 0;
  for(const file of files){
    const rel = path.relative(path.join(__dirname, '..', '..'), file).replace(/\\/g,'/'); // public/uploads/products/...
    const base = path.basename(file);
    const nameNoExt = base.replace(/\.[^.]+$/, '');

    let product = null;

    // Match by id prefix: 123-foo-bar.jpg
    const idPrefix = nameNoExt.match(/^(\d+)[-_]/);
    if(idPrefix){
      product = idMap.get(idPrefix[1]) || null;
    }

    // Match by normalized name if not found
    if(!product){
      const norm = normalizeName(nameNoExt);
      product = nameMap.get(norm) || null;
    }

    if(product){
      if(product.image_url !== rel){
        await product.update({ image_url: rel });
        updated++;
        console.log('Updated', product.product_id, '->', rel);
      }
    }
  }

  console.log('Done. Updated', updated, 'products.');
  await sequelize.close();
}

main().catch(err => { console.error(err); process.exit(1); });
















