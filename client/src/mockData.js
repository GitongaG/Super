// A list of mock users for the login page and users table
export const USERS = [
  { id: 1, name: "Admin", email: "admin@example.com", role: "Admin", password: "password" },
  { id: 2, name: "John Doe", email: "john@example.com", role: "Cashier", password: "password123" },
  { id: 3, name: "Jane Smith", email: "jane@example.com", role: "Manager", password: "password456" },
];

// A list of mock products for the inventory and sales pages
export const PRODUCTS = [
  { id: 1, name: "Coca-Cola", barcode: "123456789", quantity: 50, price: 1.50 },
  { id: 2, name: "Pepsi", barcode: "987654321", quantity: 75, price: 1.40 },
  { id: 3, name: "Doritos", barcode: "112233445", quantity: 100, price: 2.99 },
  { id: 4, name: "Lays Chips", barcode: "556677889", quantity: 20, price: 2.49 },
];

// Mock sales data to be displayed on the dashboard/reports
export const SALES = [
  { id: 1, date: "2024-08-14", total: 125.50, items: 3 },
  { id: 2, date: "2024-08-13", total: 78.25, items: 2 },
  { id: 3, date: "2024-08-12", total: 200.00, items: 5 },
];

// Mock inventory data, which can be used to track stock levels
export const INVENTORY = [
  { id: 1, item: "Coca-Cola", quantity: 50, last_updated: "2024-08-14" },
  { id: 2, item: "Pepsi", quantity: 75, last_updated: "2024-08-13" },
  { id: 3, item: "Doritos", quantity: 100, last_updated: "2024-08-12" },
];