# 🚀 Antigravity Food Delivery API

A complete backend system for online food delivery featuring **interoperability between REST and SOAP protocols**. Both interfaces share the same **MongoDB Atlas** database, meaning an order created via REST can instantly be retrieved or modified via SOAP, and vice-versa.

---

## 🌐 1. Live Browser Testing (Recommended)

The easiest way to test the API is using the built-in premium testing interfaces. No external tools required!

- **Landing Dashboard**: [https://ecufs-js.onrender.com](https://ecufs-js.onrender.com)
- **REST Tester**: [https://ecufs-js.onrender.com/rest.html](https://ecufs-js.onrender.com/rest.html)
- **SOAP Tester**: [https://ecufs-js.onrender.com/soap.html](https://ecufs-js.onrender.com/soap.html) *(Native XML fetching built in JavaScript!)*

---

## 🔌 2. REST API Endpoints (For Postman / cURL)

**Base URL:** `https://ecufs-js.onrender.com`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orders` | Create a new food order. |
| `GET` | `/orders` | Retrieve all orders. |
| `GET` | `/orders/:id` | Retrieve a specific order by ID (e.g., `ORD1`). |
| `PUT` | `/orders/:id/status` | Update the delivery status of an order. |
| `DELETE` | `/orders/:id` | Cancel an order. |

### Sample REST Requests

**Create Order (`POST /orders`)**
```json
{
  "customerName": "Alice",
  "restaurantName": "Domino's",
  "foodItems": ["Pepperoni Pizza", "Garlic Bread"],
  "totalAmount": 22.50
}
```
*Tip: Set `totalAmount` to `-1` to test a `402 Payment Failure`, or `restaurantName` to `unavailable` to test a `503` error.*

**Update Status (`PUT /orders/ORD1/status`)**
```json
{
  "status": "Out for Delivery"
}
```
*Allowed Statuses: `Placed`, `Preparing`, `Out for Delivery`, `Delivered`, `Cancelled`.*

---

## ⚙️ 3. SOAP API Endpoints (For SoapUI)

**WSDL Endpoint:** `https://ecufs-js.onrender.com/wsdl?wsdl`

Import the WSDL link above into your SOAP client (like SoapUI) to automatically generate the four operations.

### Sample SOAP XML Requests

**Place Order (`placeOrder`)**
```xml
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ord="http://www.examples.com/wsdl/OrderService.wsdl">
   <soapenv:Header/>
   <soapenv:Body>
      <ord:placeOrder>
         <customerName>Bob</customerName>
         <restaurantName>Burger King</restaurantName>
         <foodItems>Whopper,Fries</foodItems>
         <totalAmount>15.99</totalAmount>
      </ord:placeOrder>
   </soapenv:Body>
</soapenv:Envelope>
```

**Get Order Details (`getOrderDetails`)**
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

**Update Delivery Status (`updateDeliveryStatus`)**
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

**Cancel Order (`cancelOrder`)**
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

---

## 🛠️ Tech Stack

- **Node.js + Express**: High performance server and REST JSON endpoints.
- **Node-SOAP**: Native WSDL interpretation and SOAP endpoint listening.
- **MongoDB Atlas**: Persistent cloud NoSQL database bridging the state between REST and SOAP operations.
- **HTML/CSS/JS**: A custom-built, premium glassmorphism multi-page UI capable of sending native JSON and XML requests without third-party frameworks.
