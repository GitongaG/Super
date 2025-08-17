const mongoose = require('mongoose');

// User Model (for your login system)
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'cashier', 'manager'], default: 'cashier' },
  createdAt: { type: Date, default: Date.now }
});

// Product Model (matches your PRODUCTS mock data)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  barcode: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, default: 0 },
  category: String,
  reorderLevel: { type: Number, default: 10 },
  location: String, // for inventory tracking like "Shelf A1"
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Sales Transaction Model
const saleSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    quantity: Number,
    total: Number
  }],
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentMethod: { type: String, default: 'cash' },
  cashierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  cashierName: String,
  createdAt: { type: Date, default: Date.now }
});

// Inventory Model (for tracking stock movements)
const inventorySchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  type: { type: String, enum: ['stock_in', 'sale', 'adjustment'], required: true },
  quantity: { type: Number, required: true },
  previousStock: Number,
  newStock: Number,
  reason: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Create and export models
const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);
const Sale = mongoose.model('Sale', saleSchema);
const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = {
  User,
  Product,
  Sale,
  Inventory
};