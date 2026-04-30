const orderModel = require('../model/orderModel');

// SOAP service definition — maps to the WSDL operations
const soapService = {
  OrderService: {
    OrderPort: {
      // Place a new order
      placeOrder: async function(args) {
        try {
          const foodItems = args.foodItems ? args.foodItems.split(',').map(s => s.trim()) : [];

          const orderData = {
            customerName: args.customerName,
            restaurantName: args.restaurantName,
            foodItems: foodItems,
            totalAmount: parseFloat(args.totalAmount)
          };

          const newOrder = await orderModel.createOrder(orderData);
          return {
            orderId: newOrder.orderId,
            deliveryStatus: newOrder.deliveryStatus
          };
        } catch (error) {
          throw {
            Fault: {
              Code: { Value: 'soap:Client', Subcode: { value: 'rpc:BadArguments' } },
              Reason: { Text: error.message }
            }
          };
        }
      },

      // Get details of a specific order
      getOrderDetails: async function(args) {
        const order = await orderModel.getOrderById(args.orderId);
        if (!order) {
          throw {
            Fault: {
              Code: { Value: 'soap:Client' },
              Reason: { Text: 'Order not found' }
            }
          };
        }
        return {
          orderId: order.orderId,
          customerName: order.customerName,
          restaurantName: order.restaurantName,
          foodItems: order.foodItems.join(','),
          totalAmount: order.totalAmount,
          deliveryStatus: order.deliveryStatus
        };
      },

      // Update delivery status
      updateDeliveryStatus: async function(args) {
        try {
          const updatedOrder = await orderModel.updateOrderStatus(args.orderId, args.status);
          if (!updatedOrder) {
            throw new Error('Order not found');
          }
          return {
            orderId: updatedOrder.orderId,
            deliveryStatus: updatedOrder.deliveryStatus
          };
        } catch (error) {
          throw {
            Fault: {
              Code: { Value: 'soap:Client' },
              Reason: { Text: error.message }
            }
          };
        }
      },

      // Cancel an order
      cancelOrder: async function(args) {
        const cancelledOrder = await orderModel.cancelOrder(args.orderId);
        if (!cancelledOrder) {
          throw {
            Fault: {
              Code: { Value: 'soap:Client' },
              Reason: { Text: 'Order not found' }
            }
          };
        }
        return {
          orderId: cancelledOrder.orderId,
          deliveryStatus: cancelledOrder.deliveryStatus
        };
      }
    }
  }
};

module.exports = soapService;
