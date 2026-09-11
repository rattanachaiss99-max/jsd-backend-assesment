const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const router = express.Router();

// ==========================================
// Route 1: GET /products
// Return all products with optional query parameters:
// - search: filter by product name (case-insensitive)
// - sort: sort by price ('price_asc' or 'price_desc')
// ==========================================
router.get('/', async (req, res, next) => {
  try {
    const { search, sort } = req.query;
    const filter = {};

    // Query parameter: filter by product name
    if (search && typeof search === 'string' && search.trim() !== '') {
      filter.name = { $regex: search.trim(), $options: 'i' };
    }

    let query = Product.find(filter);

    // Query parameter: sort by price
    if (sort === 'price_asc') {
      query = query.sort({ price: 1 });
    } else if (sort === 'price_desc') {
      query = query.sort({ price: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const products = await query.exec();
    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// Route 2: GET /products/:id
// Return a single product by ID
// ==========================================
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: `Product with ID '${id}' was not found`
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        error: `Product with ID '${id}' was not found`
      });
    }

    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// Route 3: POST /products
// Create a new product
// ==========================================
router.post('/', async (req, res, next) => {
  try {
    const { name, price, quantity } = req.body;

    // Validation: name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        error: 'Field "name" is required and must be a non-empty string'
      });
    }

    // Validation: price
    const numericPrice = Number(price);
    if (price === undefined || isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        error: 'Field "price" is required and must be a non-negative number'
      });
    }

    // Validation: quantity
    let numericQuantity = 1;
    if (quantity !== undefined) {
      numericQuantity = Number(quantity);
      if (isNaN(numericQuantity) || numericQuantity < 0 || !Number.isInteger(numericQuantity)) {
        return res.status(400).json({
          error: 'Field "quantity" must be a non-negative integer'
        });
      }
    }

    const newProduct = new Product({
      name: name.trim(),
      price: numericPrice,
      quantity: numericQuantity
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// Route 4: PUT /products/:id
// Update an existing product
// ==========================================
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: `Product with ID '${id}' was not found`
      });
    }

    // Validation: name
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        error: 'Field "name" is required and must be a non-empty string'
      });
    }

    // Validation: price
    const numericPrice = Number(price);
    if (price === undefined || isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        error: 'Field "price" is required and must be a non-negative number'
      });
    }

    // Validation: quantity
    const updateData = {
      name: name.trim(),
      price: numericPrice
    };

    if (quantity !== undefined) {
      const numericQuantity = Number(quantity);
      if (isNaN(numericQuantity) || numericQuantity < 0 || !Number.isInteger(numericQuantity)) {
        return res.status(400).json({
          error: 'Field "quantity" must be a non-negative integer'
        });
      }
      updateData.quantity = numericQuantity;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        error: `Product with ID '${id}' was not found`
      });
    }

    res.status(200).json(updatedProduct);
  } catch (err) {
    next(err);
  }
});

// ==========================================
// Route 5: DELETE /products/:id
// Delete a product by ID
// ==========================================
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: `Product with ID '${id}' was not found`
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        error: `Product with ID '${id}' was not found`
      });
    }

    res.status(200).json({
      message: `Product '${deletedProduct.name}' (ID: ${id}) has been successfully deleted`,
      deletedProduct
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
