const Database = require('better-sqlite3');
const path = require('path');

// Initialize SQLite database
const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '..', 'database.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Create tables if they do not exist
db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId TEXT UNIQUE NOT NULL,
    customerName TEXT NOT NULL,
    restaurantName TEXT NOT NULL,
    foodItems TEXT NOT NULL,
    totalAmount REAL NOT NULL,
    deliveryStatus TEXT NOT NULL DEFAULT 'Placed',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS counters (
    id TEXT PRIMARY KEY,
    seq INTEGER DEFAULT 0
  );
`);

// Allowed statuses for validation
const allowedStatuses = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

// Transaction to generate the next order ID (ORD1, ORD2, ...)
const incrementCounter = db.transaction(() => {
  const getStmt = db.prepare('SELECT seq FROM counters WHERE id = ?');
  const row = getStmt.get('orderId');
  let nextSeq = 1;

  if (!row) {
    db.prepare('INSERT INTO counters (id, seq) VALUES (?, ?)').run('orderId', 1);
  } else {
    nextSeq = row.seq + 1;
    db.prepare('UPDATE counters SET seq = ? WHERE id = ?').run(nextSeq, 'orderId');
  }

  return `ORD${nextSeq}`;
});

// Helper to format SQLite row object to match expected API schema
function formatOrderRecord(row) {
  if (!row) return null;
  let parsedFoodItems = [];
  try {
    parsedFoodItems = JSON.parse(row.foodItems);
  } catch (e) {
    parsedFoodItems = [];
  }

  return {
    _id: row.orderId,
    orderId: row.orderId,
    customerName: row.customerName,
    restaurantName: row.restaurantName,
    foodItems: parsedFoodItems,
    totalAmount: row.totalAmount,
    deliveryStatus: row.deliveryStatus,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

// Create a new order
async function createOrder(data) {
  const { customerName, restaurantName, foodItems, totalAmount } = data;

  // Simulate restaurant unavailable error
  if (restaurantName && restaurantName.toLowerCase() === 'unavailable') {
    const error = new Error('Restaurant unavailable');
    error.status = 503;
    throw error;
  }

  // Simulate payment failure
  if (totalAmount && totalAmount < 0) {
    const error = new Error('Payment failure');
    error.status = 402;
    throw error;
  }

  const orderId = incrementCounter();
  const now = new Date().toISOString();
  const foodItemsJson = JSON.stringify(foodItems || []);
  const deliveryStatus = 'Placed';

  const stmt = db.prepare(`
    INSERT INTO orders (orderId, customerName, restaurantName, foodItems, totalAmount, deliveryStatus, createdAt, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(orderId, customerName, restaurantName, foodItemsJson, totalAmount, deliveryStatus, now, now);

  return getOrderById(orderId);
}

// Get all orders
async function getAllOrders() {
  const stmt = db.prepare('SELECT * FROM orders ORDER BY id DESC');
  const rows = stmt.all();
  return rows.map(formatOrderRecord);
}

// Get a single order by its ID
async function getOrderById(id) {
  const stmt = db.prepare('SELECT * FROM orders WHERE orderId = ?');
  const row = stmt.get(id);
  return formatOrderRecord(row);
}

// Update the delivery status of an order
async function updateOrderStatus(id, status) {
  if (!allowedStatuses.includes(status)) {
    const error = new Error(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`);
    error.status = 400;
    throw error;
  }

  const now = new Date().toISOString();
  const stmt = db.prepare('UPDATE orders SET deliveryStatus = ?, updatedAt = ? WHERE orderId = ?');
  const result = stmt.run(status, now, id);

  if (result.changes === 0) {
    return null;
  }

  return getOrderById(id);
}

// Cancel an order (Completely remove from DB)
async function cancelOrder(id) {
  const existing = await getOrderById(id);
  if (!existing) return null;

  const stmt = db.prepare('DELETE FROM orders WHERE orderId = ?');
  stmt.run(id);
  return existing;
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};

