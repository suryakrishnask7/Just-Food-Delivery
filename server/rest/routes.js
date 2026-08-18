const express = require('express');
const router = express.Router();
const controller = require('./controller');

router.post('/', controller.createOrder);
router.get('/', controller.getOrders);
router.get('/:id', controller.getOrderById);
router.put('/:id/status', controller.updateOrderStatus);
router.delete('/:id', controller.cancelOrder);

module.exports = router;
