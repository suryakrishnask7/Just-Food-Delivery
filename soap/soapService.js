const orderModel = require('../model/orderModel');

const soapService = {
  OrderService: {
    OrderPort: {
      placeOrder: function(args, cb, headers, req) {
        try {
          // Convert comma-separated foodItems to array
          const foodItems = args.foodItems ? args.foodItems.split(',') : [];
          
          const orderData = {
            customerName: args.customerName,
            restaurantName: args.restaurantName,
            foodItems: foodItems,
            totalAmount: parseFloat(args.totalAmount)
          };

          const newOrder = orderModel.createOrder(orderData);
          return {
            orderId: newOrder.orderId,
            deliveryStatus: newOrder.deliveryStatus
          };
        } catch (error) {
          throw {
            Fault: {
              Code: {
                Value: 'soap:Client',
                Subcode: { value: 'rpc:BadArguments' }
              },
              Reason: { Text: error.message }
            }
          };
        }
      },

      getOrderDetails: function(args) {
        const order = orderModel.getOrderById(args.orderId);
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

      updateDeliveryStatus: function(args) {
        try {
          const updatedOrder = orderModel.updateOrderStatus(args.orderId, args.status);
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

      cancelOrder: function(args) {
        const cancelledOrder = orderModel.cancelOrder(args.orderId);
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
