const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Product } = require('../models');
require('dotenv').config();

// Sample data based on your frontend mock data
const seedUsers = [
  {
    name: 'admin',
    email: 'admin@supermarket.com',
    password: 'password',
    role: 'admin'
  },
  {
    name: 'cashier1',
    email: 'cashier1@supermarket.com',
    password: 'password',
    role: 'cashier'
  },
  {
    name: 'manager',
    email: 'manager@supermarket.com',
    password: 'password',
    role: 'manager'
  }
];

const seedProducts = [
  {
    name: 'Apple',
    barcode: '1234567890123',
    price: 0.99,
    quantity: 100,
    category: 'Fruits',
    location: 'Shelf A1',
    reorderLevel: 20
  },
  {
    name: 'Milk',
    barcode: '2345678901234',
    price: 2.49,
    quantity: 50,
    category: 'Dairy',
    location: 'Fridge 1',
    reorderLevel: 10
  },
  {
    name: 'Bread',
    barcode: '3456789012345',
    price: 1.99,
    quantity: 30,
    category: 'Bakery',
    location: 'Shelf B2',
    reorderLevel: 15
  },
  {
    name: 'Bananas',
    barcode: '4567890123456',
    price: 1.29,
    quantity: 75,
    category: 'Fruits',
    location: 'Shelf A1',
    reorderLevel: 25
  },
  {
    name: 'Eggs',
    barcode: '5678901234567',
    price: 3.99,
    quantity: 40,
    category: 'Dairy',
    location: 'Fridge 2',
    reorderLevel: 12
  },
  {
    name: 'Cereal',
    barcode: '6789012345678',
    price: 4.99,
    quantity: 25,
    category: 'Breakfast',
    location: 'Shelf C3',
    reorderLevel: 8
  },
  {
    name: 'Orange Juice',
    barcode: '7890123456789',
    price: 3.49,
    quantity: 35,
    category: 'Beverages',
    location: 'Fridge 3',
    reorderLevel: 10
  },
  {
    name: 'Chicken Breast',
    barcode: '8901234567890',
    price: 8.99,
    quantity: 20,
    category: 'Meat',
    location: 'Freezer 1',
    reorderLevel: 5
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pos_system');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('Cleared existing data');

    // Seed Users
    console.log('Seeding users...');
    for (const userData of seedUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      console.log(`Created user: ${userData.name}`);
    }

    // Seed Products
    console.log('Seeding products...');
    for (const productData of seedProducts) {
      const product = new Product(productData);
      await product.save();
      console.log(`Created product: ${productData.name}`);
    }

    console.log('Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin / password');
    console.log('Cashier: cashier1 / password');
    console.log('Manager: manager / password');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
seedDatabase();