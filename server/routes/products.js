const express = require('express');
const { Product, Inventory } = require('../models');
const { verifyToken } = require('./auth');

const router = express.Router();

// Get all products (for your Products page and Sales search)
router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { barcode: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const products = await Product.find(query).sort({ name: 1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get product by barcode (for barcode scanning)
router.get('/barcode/:barcode', async (req, res) => {
  try {
    const product = await Product.findOne({ barcode: req.params.barcode });
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product by barcode error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add new product
router.post('/', verifyToken, async (req, res) => {
  try {
    const { name, barcode, price, quantity, category, location, reorderLevel } = req.body;

    // Check if barcode already exists
    const existingProduct = await Product.findOne({ barcode });
    if (existingProduct) {
      return res.status(400).json({ message: 'Product with this barcode already exists' });
    }

    const newProduct = new Product({
      name,
      barcode,
      price,
      quantity: quantity || 0,
      category,
      location,
      reorderLevel: reorderLevel || 10
    });

    await newProduct.save();

    // Log inventory addition if quantity > 0
    if (quantity > 0) {
      const inventoryLog = new Inventory({
        productId: newProduct._id,
        type: 'stock_in',
        quantity: quantity,
        previousStock: 0,
        newStock: quantity,
        reason: 'Initial stock',
        userId: req.user.userId
      });
      await inventoryLog.save();
    }

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { name, price, quantity, category, location, reorderLevel } = req.body;
    
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const previousStock = product.quantity;
    
    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        price,
        quantity,
        category,
        location,
        reorderLevel,
        updatedAt: new Date()
      },
      { new: true }
    );

    // Log inventory change if quantity changed
    if (quantity !== previousStock) {
      const inventoryLog = new Inventory({
        productId: product._id,
        type: 'adjustment',
        quantity: quantity - previousStock,
        previousStock,
        newStock: quantity,
        reason: 'Manual adjustment',
        userId: req.user.userId
      });
      await inventoryLog.save();
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock products (for inventory alerts)
router.get('/low-stock', async (req, res) => {
  try {
    const lowStockProducts = await Product.find({
      $expr: { $lte: ['$quantity', '$reorderLevel'] }
    }).sort({ quantity: 1 });

    res.json(lowStockProducts);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;