const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

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
// 2. In-Memory Data Store
// ==========================================
let products = [
  {
    id: '1',
    name: 'Wireless Keyboard',
    price: 49.99,
    quantity: 5
  },
  {
    id: '2',
    name: 'Ergonomic Mouse',
    price: 29.99,
    quantity: 10
  },
  {
    id: '3',
    name: 'Gaming Headset',
    price: 79.99,
    quantity: 3
  },
  {
    id: '4',
    name: 'USB-C Hub',
    price: 24.50,
    quantity: 8
  }
];

// ==========================================
// 3. API Routes
// ==========================================

// Route: Root / Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Shopping Cart API is running smoothly',
    endpoints: {
      getAllProducts: 'GET /products',
      getProductById: 'GET /products/:id',
      createProduct: 'POST /products',
      updateProduct: 'PUT /products/:id',
      deleteProduct: 'DELETE /products/:id'
    }
  });
});

// Route 1: GET /products
// Return all products, with optional query parameters:
// - search: filter by product name (case-insensitive)
// - sort: sort by price ('price_asc' or 'price_desc')
app.get('/products', (req, res) => {
  let result = [...products];
  const { search, sort } = req.query;

  // Query parameter: filter by product name
  if (search && typeof search === 'string' && search.trim() !== '') {
    const keyword = search.trim().toLowerCase();
    result = result.filter(item => item.name.toLowerCase().includes(keyword));
  }

  // Query parameter: sort by price
  if (sort === 'price_asc') {
    result.sort((a, b) => a.price - b.price);
  } else if (sort === 'price_desc') {
    result.sort((a, b) => b.price - a.price);
  }

  res.status(200).json(result);
});

// Route 2: GET /products/:id
// Return a single product by ID
app.get('/products/:id', (req, res) => {
  const { id } = req.params;
  const product = products.find(item => item.id === id);

  if (!product) {
    return res.status(404).json({
      error: `Product with ID '${id}' was not found`
    });
  }

  res.status(200).json(product);
});

// Route 3: POST /products
// Create a new product
app.post('/products', (req, res) => {
  const { name, price, quantity } = req.body;

  // Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      error: 'Field "name" is required and must be a non-empty string'
    });
  }

  const numericPrice = Number(price);
  if (price === undefined || isNaN(numericPrice) || numericPrice < 0) {
    return res.status(400).json({
      error: 'Field "price" is required and must be a non-negative number'
    });
  }

  let numericQuantity = 1;
  if (quantity !== undefined) {
    numericQuantity = Number(quantity);
    if (isNaN(numericQuantity) || numericQuantity < 0 || !Number.isInteger(numericQuantity)) {
      return res.status(400).json({
        error: 'Field "quantity" must be a non-negative integer'
      });
    }
  }

  const newProduct = {
    id: String(Date.now()),
    name: name.trim(),
    price: numericPrice,
    quantity: numericQuantity
  };

  products.push(newProduct);
  res.status(201).json(newProduct);
});

// Route 4: PUT /products/:id
// Update an existing product
app.put('/products/:id', (req, res) => {
  const { id } = req.params;
  const { name, price, quantity } = req.body;

  const productIndex = products.findIndex(item => item.id === id);
  if (productIndex === -1) {
    return res.status(404).json({
      error: `Product with ID '${id}' was not found`
    });
  }

  // Validation
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return res.status(400).json({
      error: 'Field "name" is required and must be a non-empty string'
    });
  }

  const numericPrice = Number(price);
  if (price === undefined || isNaN(numericPrice) || numericPrice < 0) {
    return res.status(400).json({
      error: 'Field "price" is required and must be a non-negative number'
    });
  }

  let numericQuantity = products[productIndex].quantity;
  if (quantity !== undefined) {
    numericQuantity = Number(quantity);
    if (isNaN(numericQuantity) || numericQuantity < 0 || !Number.isInteger(numericQuantity)) {
      return res.status(400).json({
        error: 'Field "quantity" must be a non-negative integer'
      });
    }
  }

  const updatedProduct = {
    id,
    name: name.trim(),
    price: numericPrice,
    quantity: numericQuantity
  };

  products[productIndex] = updatedProduct;
  res.status(200).json(updatedProduct);
});

// Route 5: DELETE /products/:id
// Delete a product by ID
app.delete('/products/:id', (req, res) => {
  const { id } = req.params;
  const productIndex = products.findIndex(item => item.id === id);

  if (productIndex === -1) {
    return res.status(404).json({
      error: `Product with ID '${id}' was not found`
    });
  }

  const deletedProduct = products.splice(productIndex, 1)[0];
  res.status(200).json({
    message: `Product '${deletedProduct.name}' (ID: ${id}) has been successfully deleted`,
    deletedProduct
  });
});

// ==========================================
// 4. 404 Not Found Handler for undefined routes
// ==========================================
app.use((req, res, next) => {
  res.status(404).json({
    error: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ==========================================
// 5. Global Error Handling Middleware
// ==========================================
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error'
  });
});

// ==========================================
// 6. Start Server
// ==========================================
app.listen(PORT, () => {
  console.log(`========================================`);
  console.log(` Shopping Cart API running on port ${PORT}`);
  console.log(` URL: http://localhost:${PORT}`);
  console.log(`========================================`);
});
