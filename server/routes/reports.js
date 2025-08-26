const express = require("express");
const router = express.Router();
const { Product, Sale } = require("../models"); // Ensure Product and Sale are exported from models/index.js

// GET /api/reports
router.get("/", async (req, res) => {
  try {
    // ✅ 1. Low stock products (<5 units)
    const lowStock = await Product.find({ quantity: { $lt: 5 } }).lean();

    // ✅ 2. Sales grouped by day
    const salesByDay = await Sale.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$total" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // ✅ 3. Top 3 products sold
    const topProducts = await Sale.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          totalSold: { $sum: "$items.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 3 },
    ]);

    // ✅ 4. Monthly revenue
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyRevenueResult = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, revenue: { $sum: "$total" } } },
    ]);

    const monthlyRevenue = monthlyRevenueResult.length > 0 
      ? monthlyRevenueResult[0].revenue 
      : 0;

    // ✅ Final Response
    res.json({
      lowStock,
      salesByDay,
      topProducts,
      monthlyRevenue,
    });

  } catch (err) {
    console.error("Error generating reports:", err.message);
    res.status(500).json({ 
      success: false, 
      error: "Failed to generate reports", 
      details: err.message 
    });
  }
});

module.exports = router;
