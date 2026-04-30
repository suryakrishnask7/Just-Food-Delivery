const orderModel = require('../model/orderModel');

// POST /orders - Create a new order
const createOrder = async (req, res, next) => {
  try {
    const { customerName, restaurantName, foodItems, totalAmount } = req.body;

    // Validation
    if (!customerName || !restaurantName || !foodItems || totalAmount === undefined) {
      return res.status(400).json({ error: 'Missing required fields: customerName, restaurantName, foodItems, totalAmount', status: 400 });
    }
    if (!Array.isArray(foodItems)) {
      return res.status(400).json({ error: 'foodItems must be an array', status: 400 });
    }

    const newOrder = await orderModel.createOrder(req.body);
    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
};

// GET /orders - Get all orders
const getOrders = async (req, res, next) => {
  try {
    const orders = await orderModel.getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

// GET /orders/:id - Get order by ID
const getOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found', status: 404 });
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

// PUT /orders/:id/status - Update delivery status
const updateOrderStatus = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Missing status field', status: 400 });
    }

    const updatedOrder = await orderModel.updateOrderStatus(orderId, status);
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found', status: 404 });
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

// DELETE /orders/:id - Cancel an order
const cancelOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const cancelledOrder = await orderModel.cancelOrder(orderId);

    if (!cancelledOrder) {
      return res.status(404).json({ error: 'Order not found', status: 404 });
    }

    res.status(200).json(cancelledOrder);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
