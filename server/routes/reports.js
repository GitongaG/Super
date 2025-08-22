const express = require("express");
const router = express.Router();
const { Product, Sale } = require("../models"); // ensure Product and Sale are exported from models/index.js

// GET /api/reports
router.get("/", async (req, res) => {
  try {
    // Products running low (below 5 units)
    const lowStock = await Product.find({ quantity: { $lt: 5 } });

    // Total sales by day (group by createdAt)
    const salesByDay = await Sale.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$total" }, // ✅ use your schema field "total"
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top 3 products by quantity sold
    const topProducts = await Sale.aggregate([
      { $unwind: "$items" }, // break out items array
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

    // Monthly revenue
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyRevenue = await Sale.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, revenue: { $sum: "$total" } } },
    ]);

    res.json({
      lowStock,
      salesByDay,
      topProducts,
      monthlyRevenue: monthlyRevenue[0]?.revenue || 0,
    });
  } catch (err) {
    console.error("Error generating reports:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
