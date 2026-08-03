import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Brand from './models/Brand.js';
import Category from './models/Category.js';
import Collection from './models/Collection.js';
import Product from './models/Product.js';

async function seed() {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([
    Brand.deleteMany({}),
    Category.deleteMany({}),
    Collection.deleteMany({}),
    Product.deleteMany({}),
  ]);

  console.log('Seeding brands...');
  const brands = await Brand.insertMany([
    { name: 'Lattafa', slug: 'lattafa' },
    { name: 'Armaf', slug: 'armaf' },
    { name: 'Afnan', slug: 'afnan' },
    { name: 'Al Haramain', slug: 'al-haramain' },
    { name: 'Rasasi', slug: 'rasasi' },
  ]);
  const byBrand = Object.fromEntries(brands.map(b => [b.name, b._id]));

  console.log('Seeding categories...');
  const categories = await Category.insertMany([
    { name: 'Perfume', slug: 'perfume' },
    { name: 'Oils', slug: 'oils' },
    { name: 'Gift Sets', slug: 'gift-sets' },
    { name: 'Decants', slug: 'decants' },
  ]);
  const byCategory = Object.fromEntries(categories.map(c => [c.name, c._id]));

  console.log('Seeding collections...');
  const collections = await Collection.insertMany([
    { name: "Men's Collection", slug: 'mens-collection', featured: true },
    { name: "Women's Collection", slug: 'womens-collection', featured: true },
    { name: 'Unisex Collection', slug: 'unisex-collection', featured: true },
    { name: 'Arabic Perfume Oils', slug: 'arabic-perfume-oils', featured: false },
    { name: 'Luxury Gift Sets', slug: 'luxury-gift-sets', featured: false },
    { name: 'Decants (5ml & 10ml)', slug: 'decants', featured: false },
  ]);
  const byCollection = Object.fromEntries(collections.map(c => [c.name, c._id]));

  console.log('Seeding products...');
  await Product.insertMany([
    {
      name: 'Khamrah Qahwa', slug: 'khamrah-qahwa',
      brand: byBrand['Lattafa'], category: byCategory['Perfume'],
      collections: [byCollection["Men's Collection"]],
      gender: "Men's", price: 8900, rating: 5, reviewCount: 42, badge: 'New', tags: ['new'],
      newArrival: true,
      description: 'A warm, coffee-laced oriental fragrance layered with cinnamon, cardamom and rich amber — Khamrah Qahwa opens with spiced espresso and settles into a deep, long-lasting base of oud and vanilla.',
      notes: { top: 'Cardamom, Cinnamon, Coffee', middle: 'Praline, Amber, Saffron', base: 'Oud, Vanilla, Musk' },
      sizes: [
        { label: '5ml Decant', price: 1800 },
        { label: '10ml Decant', price: 3200 },
        { label: 'Full Bottle 100ml', price: 8900 },
      ],
    },
    {
      name: 'Club de Nuit Intense', slug: 'club-de-nuit-intense',
      brand: byBrand['Armaf'], category: byCategory['Perfume'],
      collections: [byCollection["Men's Collection"]],
      gender: "Men's", price: 7200, oldPrice: 9500, rating: 5, reviewCount: 30, badge: 'Sale', tags: ['popular'],
      bestSeller: true,
      description: 'A bold, smoky, citrus-pineapple opening over a warm ambery base — the fragrance famously compared to a certain iconic French designer scent, at a fraction of the price.',
      notes: { top: 'Pineapple, Lemon, Bergamot', middle: 'Birch, Blackcurrant, Jasmine', base: 'Musk, Vanilla, Amber' },
      sizes: [
        { label: '5ml Decant', price: 1500 },
        { label: '10ml Decant', price: 2600 },
        { label: 'Full Bottle 105ml', price: 7200 },
      ],
    },
    {
      name: 'Supremacy Silver', slug: 'supremacy-silver',
      brand: byBrand['Afnan'], category: byCategory['Perfume'],
      collections: [byCollection["Men's Collection"]],
      gender: "Men's", price: 6500, rating: 4, reviewCount: 18, tags: [],
      description: 'A fresh, clean, aquatic-woody fragrance built for daytime wear — crisp top notes settling into a soft musky base.',
      notes: { top: 'Bergamot, Green Apple', middle: 'Lavender, Geranium', base: 'Musk, Cedarwood' },
      sizes: [
        { label: '5ml Decant', price: 1200 },
        { label: 'Full Bottle 100ml', price: 6500 },
      ],
    },
    {
      name: 'Amber Oud Gold', slug: 'amber-oud-gold',
      brand: byBrand['Al Haramain'], category: byCategory['Perfume'],
      collections: [byCollection['Unisex Collection']],
      gender: 'Unisex', price: 11400, rating: 5, reviewCount: 55, badge: 'Best Seller', tags: ['bestseller'],
      bestSeller: true, featured: true,
      description: 'Rich, resinous amber and oud layered with warm spices — an opulent, long-lasting signature scent for evening wear.',
      notes: { top: 'Saffron, Cinnamon', middle: 'Amber, Rose', base: 'Oud, Sandalwood, Musk' },
      sizes: [
        { label: '10ml Decant', price: 3800 },
        { label: 'Full Bottle 60ml', price: 11400 },
      ],
    },
    {
      name: 'Hawas for Her', slug: 'hawas-for-her',
      brand: byBrand['Rasasi'], category: byCategory['Perfume'],
      collections: [byCollection["Women's Collection"]],
      gender: "Women's", price: 6900, rating: 4, reviewCount: 22, tags: ['popular'],
      description: 'A sweet, fruity-floral fragrance with a gourmand edge — playful and long-lasting, perfect for everyday wear.',
      notes: { top: 'Pink Pepper, Raspberry', middle: 'Jasmine, Rose', base: 'Vanilla, Musk' },
      sizes: [
        { label: '5ml Decant', price: 1400 },
        { label: 'Full Bottle 100ml', price: 6900 },
      ],
    },
    {
      name: 'Yara Moi', slug: 'yara-moi',
      brand: byBrand['Lattafa'], category: byCategory['Perfume'],
      collections: [byCollection["Women's Collection"]],
      gender: "Women's", price: 7500, oldPrice: 8200, rating: 5, reviewCount: 38, badge: 'Sale', tags: [],
      description: 'A luminous, sweet vanilla-fruity fragrance with a soft floral heart — Yara Moi is bright, feminine, and long-lasting.',
      notes: { top: 'Orange Blossom, Pear', middle: 'Jasmine, Tuberose', base: 'Vanilla, Sandalwood' },
      sizes: [
        { label: '5ml Decant', price: 1600 },
        { label: 'Full Bottle 100ml', price: 7500 },
      ],
    },
    {
      name: '9pm Oil', slug: '9pm-oil',
      brand: byBrand['Afnan'], category: byCategory['Oils'],
      collections: [byCollection["Men's Collection"], byCollection['Arabic Perfume Oils']],
      gender: "Men's", price: 4200, rating: 5, reviewCount: 27, tags: ['bestseller'],
      bestSeller: true,
      description: 'An alcohol-free oil version of the beloved 9pm fragrance — concentrated, long-lasting, and skin-friendly.',
      notes: { top: 'Apple, Cinnamon', middle: 'Amber, Vanilla', base: 'Musk, Woods' },
      sizes: [
        { label: '3ml Oil', price: 1200 },
        { label: '6ml Oil', price: 4200 },
      ],
    },
    {
      name: 'Amber Oud Decant 5ml', slug: 'amber-oud-decant-5ml',
      brand: byBrand['Al Haramain'], category: byCategory['Decants'],
      collections: [byCollection['Unisex Collection'], byCollection['Decants (5ml & 10ml)']],
      gender: 'Unisex', price: 1800, rating: 4, reviewCount: 12, badge: 'New', tags: ['new'],
      newArrival: true,
      description: 'Try the full Amber Oud Gold experience in a convenient 5ml decant before committing to a full bottle.',
      notes: { top: 'Saffron, Cinnamon', middle: 'Amber, Rose', base: 'Oud, Sandalwood, Musk' },
      sizes: [{ label: '5ml Decant', price: 1800 }],
    },
  ]);

  console.log('Seed complete.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});