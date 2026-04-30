# Online Food Delivery System

A complete backend for an online food delivery system using Node.js, Express.js, and SOAP. The application supports BOTH REST and SOAP APIs sharing an in-memory data store. Ready to be deployed to Render!

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the application:**
   ```bash
   npm start
   ```

The application will be accessible at `http://localhost:8000`. If you deploy to Render, it will bind to the `PORT` environment variable provided by Render.

---

## Testing the REST APIs (via Postman)

### 1. Create a New Order (POST /orders)

**Request URL:** `POST http://localhost:8000/orders`
**Request Body (JSON):**
```json
{
  "customerName": "John Doe",
  "restaurantName": "Pizza Hut",
  "foodItems": ["Margherita Pizza", "Garlic Bread"],
  "totalAmount": 25.50
}
```
**Error Simulation (402 Payment Failure):** Set `"totalAmount": -10`
**Error Simulation (503 Restaurant Unavailable):** Set `"restaurantName": "unavailable"`

### 2. Get All Orders (GET /orders)

**Request URL:** `GET http://localhost:8000/orders`

### 3. Get Specific Order (GET /orders/:id)

**Request URL:** `GET http://localhost:8000/orders/ORD1`

### 4. Update Delivery Status (PUT /orders/:id/status)

**Request URL:** `PUT http://localhost:8000/orders/ORD1/status`
**Request Body (JSON):**
```json
{
  "status": "Out for Delivery"
}
```
*(Allowed statuses: Placed, Preparing, Out for Delivery, Delivered, Cancelled)*

### 5. Cancel Order (DELETE /orders/:id)

**Request URL:** `DELETE http://localhost:8000/orders/ORD1`

---

## Testing the SOAP APIs (via SoapUI)

**WSDL Endpoint:** `http://localhost:8000/wsdl?wsdl`

### 1. Place Order

**Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ord="http://www.examples.com/wsdl/OrderService.wsdl">
   <soapenv:Header/>
   <soapenv:Body>
      <ord:placeOrder>
         <customerName>Jane Doe</customerName>
         <restaurantName>Burger King</restaurantName>
         <foodItems>Whopper,Fries</foodItems>
         <totalAmount>15.99</totalAmount>
      </ord:placeOrder>
   </soapenv:Body>
</soapenv:Envelope>
```

### 2. Get Order Details

**Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ord="http://www.examples.com/wsdl/OrderService.wsdl">
   <soapenv:Header/>
   <soapenv:Body>
      <ord:getOrderDetails>
         <orderId>ORD1</orderId>
      </ord:getOrderDetails>
   </soapenv:Body>
</soapenv:Envelope>
```

### 3. Update Delivery Status

**Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ord="http://www.examples.com/wsdl/OrderService.wsdl">
   <soapenv:Header/>
   <soapenv:Body>
      <ord:updateDeliveryStatus>
         <orderId>ORD1</orderId>
         <status>Delivered</status>
      </ord:updateDeliveryStatus>
   </soapenv:Body>
</soapenv:Envelope>
```

### 4. Cancel Order

**Request:**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ord="http://www.examples.com/wsdl/OrderService.wsdl">
   <soapenv:Header/>
   <soapenv:Body>
      <ord:cancelOrder>
         <orderId>ORD1</orderId>
      </ord:cancelOrder>
   </soapenv:Body>
</soapenv:Envelope>
```
