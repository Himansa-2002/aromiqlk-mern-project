import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';

import homeRoutes from './routes/home.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import brandRoutes from './routes/brands.js';
import collectionRoutes from './routes/collections.js';
import contactRoutes from './routes/contact.js';
import newsletterRoutes from './routes/newsletter.js';
import reviewRoutes from './routes/reviews.js';
import bannerRoutes from './routes/banners.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/home', homeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/banners', bannerRoutes);

app.get('/', (req, res) => {
  res.send('Aromiq.lk API is running.');
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});