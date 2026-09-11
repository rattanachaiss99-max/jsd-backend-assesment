require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const productRoutes = require('./routes/products');
const Product = require('./models/Product');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopping-cart';

// ==========================================
// 1. Middlewares
// ==========================================

// Custom Request Logger Middleware
// Logs incoming request method, URL, and timestamp
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Enable CORS (Cross-Origin Resource Sharing)
// Allows frontend running on a different port (e.g. Vite on 5173) to communicate with this API
app.use(cors());

// Parse incoming requests with JSON payloads
// Attaches parsed JSON to req.body
app.use(express.json());

// ==========================================
// 2. API Routes
// ==========================================

// Route: Root / Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Shopping Cart API is running smoothly with MongoDB Atlas & Router integration',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting/Disconnected',
    endpoints: {
      getAllProducts: 'GET /products',
      getProductById: 'GET /products/:id',
      createProduct: 'POST /products',
      updateProduct: 'PUT /products/:id',
      deleteProduct: 'DELETE /products/:id'
    }
  });
});

// Mount modular products router
app.use('/products', productRoutes);

// ==========================================
// 3. 404 Not Found Handler for undefined routes
// ==========================================
app.use((req, res, next) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ==========================================
// 4. Global Error Handling Middleware
// ==========================================
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error'
  });
});

// ==========================================
// 5. Database Connection & Server Startup
// ==========================================
async function seedInitialProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Database empty. Seeding initial sample products...');
      const seedData = [
        { name: 'Wireless Keyboard', price: 49.99, quantity: 5 },
        { name: 'Ergonomic Mouse', price: 29.99, quantity: 10 },
        { name: 'Gaming Headset', price: 79.99, quantity: 3 },
        { name: 'USB-C Hub', price: 24.50, quantity: 8 }
      ];
      await Product.insertMany(seedData);
      console.log('Initial sample products seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding initial products:', err.message);
  }
}

async function startServer() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    await mongoose.connect(MONGODB_URI);
    console.log('Successfully connected to MongoDB.');

    // Seed data if empty
    await seedInitialProducts();

    app.listen(PORT, () => {
      console.log(`========================================`);
      console.log(` Shopping Cart API running on port ${PORT}`);
      console.log(` URL: http://localhost:${PORT}`);
      console.log(` Database: MongoDB`);
      console.log(`========================================`);
    });
  } catch (err) {
    console.error('Fatal: Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
}

startServer();
