import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import Product from './models/Product.js';

// Same sample data that used to live in shop.php / index.php as PHP
// arrays — now seeded into MongoDB so the API has something to serve.
// Run with: npm run seed
const products = [
  {
    brand: 'Lattafa', name: 'Khamrah Qahwa', gender: "Men's", category: 'Perfume',
    price: 8900, rating: 5, reviewsCount: 42, badge: 'New', tags: ['new'],
    description: 'A warm, coffee-laced oriental fragrance layered with cinnamon, cardamom and rich amber — Khamrah Qahwa opens with spiced espresso and settles into a deep, long-lasting base of oud and vanilla.',
    topNotes: 'Cardamom, Cinnamon, Coffee', middleNotes: 'Praline, Amber, Saffron', baseNotes: 'Oud, Vanilla, Musk',
    sizes: { '5ml Decant': 1800, '10ml Decant': 3200, 'Full Bottle 100ml': 8900 },
  },
  {
    brand: 'Armaf', name: 'Club de Nuit Intense', gender: "Men's", category: 'Perfume',
    price: 7200, oldPrice: 9500, rating: 5, reviewsCount: 30, badge: 'Sale', tags: ['popular'],
    description: 'A bold, smoky, citrus-pineapple opening over a warm ambery base — the fragrance famously compared to a certain iconic French designer scent, at a fraction of the price.',
    topNotes: 'Pineapple, Lemon, Bergamot', middleNotes: 'Birch, Blackcurrant, Jasmine', baseNotes: 'Musk, Vanilla, Amber',
    sizes: { '5ml Decant': 1500, '10ml Decant': 2600, 'Full Bottle 105ml': 7200 },
  },
  {
    brand: 'Afnan', name: 'Supremacy Silver', gender: "Men's", category: 'Perfume',
    price: 6500, rating: 4, reviewsCount: 18, tags: [],
    description: 'A fresh, clean, aquatic-woody fragrance built for daytime wear — crisp top notes settling into a soft musky base.',
    topNotes: 'Bergamot, Green Apple', middleNotes: 'Lavender, Geranium', baseNotes: 'Musk, Cedarwood',
    sizes: { '5ml Decant': 1200, 'Full Bottle 100ml': 6500 },
  },
  {
    brand: 'Al Haramain', name: 'Amber Oud Gold', gender: 'Unisex', category: 'Perfume',
    price: 11400, rating: 5, reviewsCount: 55, badge: 'Best Seller', tags: ['bestseller'],
    description: 'Rich, resinous amber and oud layered with warm spices — an opulent, long-lasting signature scent for evening wear.',
    topNotes: 'Saffron, Cinnamon', middleNotes: 'Amber, Rose', baseNotes: 'Oud, Sandalwood, Musk',
    sizes: { '10ml Decant': 3800, 'Full Bottle 60ml': 11400 },
  },
  {
    brand: 'Rasasi', name: 'Hawas for Her', gender: "Women's", category: 'Perfume',
    price: 6900, rating: 4, reviewsCount: 22, tags: ['popular'],
    description: 'A sweet, fruity-floral fragrance with a gourmand edge — playful and long-lasting, perfect for everyday wear.',
    topNotes: 'Pink Pepper, Raspberry', middleNotes: 'Jasmine, Rose', baseNotes: 'Vanilla, Musk',
    sizes: { '5ml Decant': 1400, 'Full Bottle 100ml': 6900 },
  },
  {
    brand: 'Lattafa', name: 'Yara Moi', gender: "Women's", category: 'Perfume',
    price: 7500, oldPrice: 8200, rating: 5, reviewsCount: 38, badge: 'Sale', tags: [],
    description: 'A luminous, sweet vanilla-fruity fragrance with a soft floral heart — Yara Moi is bright, feminine, and long-lasting.',
    topNotes: 'Orange Blossom, Pear', middleNotes: 'Jasmine, Tuberose', baseNotes: 'Vanilla, Sandalwood',
    sizes: { '5ml Decant': 1600, 'Full Bottle 100ml': 7500 },
  },
  {
    brand: 'Afnan', name: '9pm Oil', gender: "Men's", category: 'Oils',
    price: 4200, rating: 5, reviewsCount: 27, tags: ['bestseller'],
    description: 'An alcohol-free oil version of the beloved 9pm fragrance — concentrated, long-lasting, and skin-friendly.',
    topNotes: 'Apple, Cinnamon', middleNotes: 'Amber, Vanilla', baseNotes: 'Musk, Woods',
    sizes: { '3ml Oil': 1200, '6ml Oil': 4200 },
  },
  {
    brand: 'Al Haramain', name: 'Amber Oud Decant 5ml', gender: 'Unisex', category: 'Decants',
    price: 1800, rating: 4, reviewsCount: 12, badge: 'New', tags: ['new'],
    description: 'Try the full Amber Oud Gold experience in a convenient 5ml decant before committing to a full bottle.',
    topNotes: 'Saffron, Cinnamon', middleNotes: 'Amber, Rose', baseNotes: 'Oud, Sandalwood, Musk',
    sizes: { '5ml Decant': 1800 },
  },
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);
  await mongoose.connection.close();
  process.exit(0);
}

seed();
