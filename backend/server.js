import 'dotenv/config';
console.log('JWT loaded:', Boolean(process.env.JWT_SECRET));
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

// Developer 2 routes
import authRoutes from './routes/authRoutes.js';

// Error middleware
import {
  notFound,
  errorHandler,
} from './middleware/errorHandler.js';

// Create Express application
const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Basic API route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Aromiq API is running',
  });
});

// Existing Developer 1 routes
app.use('/api/home', homeRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/banners', bannerRoutes);

// Developer 2 authentication routes
app.use('/api/auth', authRoutes);

// Health-check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

// Error handlers must stay after all routes
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

/**
 * Connect to MongoDB before starting the server.
 */
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(
        `Server running in ${
          process.env.NODE_ENV || 'development'
        } mode on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();