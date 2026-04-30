const mongoose = require('mongoose');

// Define the Order schema
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  restaurantName: { type: String, required: true },
  foodItems: { type: [String], default: [] },
  totalAmount: { type: Number, required: true },
  deliveryStatus: {
    type: String,
    enum: ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'],
    default: 'Placed'
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// Counter collection to auto-generate ORD1, ORD2, etc.
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});
const Counter = mongoose.model('Counter', counterSchema);

// Allowed statuses for validation
const allowedStatuses = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];

// Generate the next order ID (ORD1, ORD2, ...)
async function generateId() {
  const counter = await Counter.findByIdAndUpdate(
    'orderId',
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return `ORD${counter.seq}`;
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

  const orderId = await generateId();
  const order = new Order({
    orderId,
    customerName,
    restaurantName,
    foodItems: foodItems || [],
    totalAmount,
    deliveryStatus: 'Placed'
  });

  await order.save();
  return order;
}

// Get all orders
async function getAllOrders() {
  return await Order.find({});
}

// Get a single order by its ID
async function getOrderById(id) {
  return await Order.findOne({ orderId: id });
}

// Update the delivery status of an order
async function updateOrderStatus(id, status) {
  if (!allowedStatuses.includes(status)) {
    const error = new Error(`Invalid status. Allowed values: ${allowedStatuses.join(', ')}`);
    error.status = 400;
    throw error;
  }

  const order = await Order.findOneAndUpdate(
    { orderId: id },
    { deliveryStatus: status },
    { new: true }
  );
  return order; // null if not found
}

// Cancel an order
async function cancelOrder(id) {
  const order = await Order.findOneAndUpdate(
    { orderId: id },
    { deliveryStatus: 'Cancelled' },
    { new: true }
  );
  return order; // null if not found
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
