import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import productRoutes from './routes/products.js';
import contactRoutes from './routes/contact.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/products', productRoutes);
app.use('/api/contact', contactRoutes);

app.get('/', (req, res) => {
  res.send('Aromiq.lk API is running.');
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
