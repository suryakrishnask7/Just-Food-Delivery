class OrderModel {
  constructor() {
    this.orders = [];
    this.idCounter = 1;
    this.allowedStatuses = ['Placed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled'];
  }

  generateId() {
    return `ORD${this.idCounter++}`;
  }

  createOrder(data) {
    const { customerName, restaurantName, foodItems, totalAmount } = data;
    
    // Simulate error (e.g. restaurant unavailable)
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

    const order = {
      orderId: this.generateId(),
      customerName,
      restaurantName,
      foodItems: foodItems || [],
      totalAmount,
      deliveryStatus: 'Placed'
    };
    
    this.orders.push(order);
    return order;
  }

  getAllOrders() {
    return this.orders;
  }

  getOrderById(id) {
    return this.orders.find(o => o.orderId === id);
  }

  updateOrderStatus(id, status) {
    if (!this.allowedStatuses.includes(status)) {
      const error = new Error(`Invalid status. Allowed values: ${this.allowedStatuses.join(', ')}`);
      error.status = 400;
      throw error;
    }

    const order = this.getOrderById(id);
    if (!order) {
      return null;
    }

    order.deliveryStatus = status;
    return order;
  }

  cancelOrder(id) {
    const order = this.getOrderById(id);
    if (!order) {
      return null;
    }
    order.deliveryStatus = 'Cancelled';
    return order;
  }
}

// Export a singleton instance so REST and SOAP share the same memory
module.exports = new OrderModel();
