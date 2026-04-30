const orderModel = require('../model/orderModel');

const createOrder = (req, res, next) => {
  try {
    const { customerName, restaurantName, foodItems, totalAmount } = req.body;
    
    // Validation
    if (!customerName || !restaurantName || !foodItems || totalAmount === undefined) {
      return res.status(400).json({ error: 'Missing required fields: customerName, restaurantName, foodItems, totalAmount', status: 400 });
    }
    if (!Array.isArray(foodItems)) {
      return res.status(400).json({ error: 'foodItems must be an array', status: 400 });
    }

    const newOrder = orderModel.createOrder(req.body);
    res.status(201).json(newOrder);
  } catch (error) {
    next(error);
  }
};

const getOrders = (req, res, next) => {
  try {
    const orders = orderModel.getAllOrders();
    res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
};

const getOrderById = (req, res, next) => {
  try {
    const orderId = req.params.id;
    const order = orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found', status: 404 });
    }
    res.status(200).json(order);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Missing status field', status: 400 });
    }

    const updatedOrder = orderModel.updateOrderStatus(orderId, status);
    if (!updatedOrder) {
      return res.status(404).json({ error: 'Order not found', status: 404 });
    }
    
    res.status(200).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

const cancelOrder = (req, res, next) => {
  try {
    const orderId = req.params.id;
    const cancelledOrder = orderModel.cancelOrder(orderId);
    
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
