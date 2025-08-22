const express = require("express");
const router = express.Router();
const { Product, Sale } = require("../models"); // make sure Product and Sale exist in your models

// GET /api/reports
router.get("/", async (req, res) => {
  try {
    // Products running low
    const lowStock = await Product.find({ quantity: { $lt: 5 } });

    // Total sales by day (group by date)
    const salesByDay = await Sale.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top 3 products
    const topProducts = await Sale.aggregate([
      {
        $group: {
          _id: "$productId",
          totalSold: { $sum: "$quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 3 },
    ]);

    // Monthly revenue
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthlyRevenue = await Sale.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, revenue: { $sum: "$amount" } } },
    ]);

    res.json({
      lowStock,
      salesByDay,
      topProducts,
      monthlyRevenue: monthlyRevenue[0]?.revenue || 0,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
