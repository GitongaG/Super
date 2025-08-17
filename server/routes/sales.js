const express = require('express');
const { Sale, Product, Inventory } = require('../models');
const { verifyToken } = require('./auth');

const router = express.Router();

// Process a sale (from your Sales page)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { items, subtotal, tax, total, paymentMethod } = req.body;

    // Generate transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Check stock availability for all items
    for (const item of items) {
      const product = await Product.findById(item.id || item.productId);
      if (!product) {
        return res.status(400).json({ message: `Product ${item.name} not found` });
      }
      
      if (product.quantity < item.qty) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${item.name}. Available: ${product.quantity}, Required: ${item.qty}` 
        });
      }
    }

    // Create sale record
    const saleItems = items.map(item => ({
      productId: item.id || item.productId,
      name: item.name,
      price: item.price,
      quantity: item.qty,
      total: item.price * item.qty
    }));

    const newSale = new Sale({
      transactionId,
      items: saleItems,
      subtotal,
      tax,
      total,
      paymentMethod: paymentMethod || 'cash',
      cashierId: req.user.userId,
      cashierName: req.user.name
    });

    await newSale.save();

    // Update product quantities and log inventory movements
    for (const item of items) {
      const product = await Product.findById(item.id || item.productId);
      const previousStock = product.quantity;
      const newStock = previousStock - item.qty;

      // Update product quantity
      await Product.findByIdAndUpdate(
        item.id || item.productId,
        { 
          quantity: newStock,
          updatedAt: new Date()
        }
      );

      // Log inventory movement
      const inventoryLog = new Inventory({
        productId: item.id || item.productId,
        type: 'sale',
        quantity: -item.qty,
        previousStock,
        newStock,
        reason: `Sale - ${transactionId}`,
        userId: req.user.userId
      });
      await inventoryLog.save();
    }

    res.status(201).json({
      message: 'Sale completed successfully',
      sale: newSale,
      receipt: {
        transactionId,
        items: saleItems,
        subtotal,
        tax,
        total,
        paymentMethod: paymentMethod || 'cash',
        cashier: req.user.name,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Process sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get sales history (for Reports page)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      cashier, 
      page = 1, 
      limit = 50 
    } = req.query;

    let query = {};

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Cashier filter
    if (cashier) {
      query.cashierName = { $regex: cashier, $options: 'i' };
    }

    const sales = await Sale.find(query)
      .populate('items.productId', 'name barcode')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Sale.countDocuments(query);

    res.json({
      sales,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get daily sales summary
router.get('/daily-summary', verifyToken, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    
    // Set to start and end of day
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const summary = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: '$total' },
          totalTransactions: { $sum: 1 },
          totalItems: { $sum: { $sum: '$items.quantity' } },
          totalTax: { $sum: '$tax' },
          avgTransactionValue: { $avg: '$total' }
        }
      }
    ]);

    const result = summary[0] || {
      totalSales: 0,
      totalTransactions: 0,
      totalItems: 0,
      totalTax: 0,
      avgTransactionValue: 0
    };

    res.json({
      date: targetDate.toISOString().split('T')[0],
      ...result
    });

  } catch (error) {
    console.error('Daily summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get top selling products
router.get('/top-products', verifyToken, async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const topProducts = await Sale.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.productId',
          name: { $first: '$items.name' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.total' },
          avgPrice: { $avg: '$items.price' }
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    res.json(topProducts);

  } catch (error) {
    console.error('Top products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;