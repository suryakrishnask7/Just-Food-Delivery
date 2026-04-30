# Comprehensive Project Documentation
## Just Food Delivery API (REST & SOAP)

### 1. Project Overview
The goal of this project was to build a complete backend for an **Online Food Delivery System** that supports both **REST** and **SOAP** web services simultaneously. A major requirement was that both protocols must share the exact same dataset, meaning an order placed via SOAP must be retrievable via REST, and vice-versa.

### 2. Technology Stack
* **Backend Framework:** Node.js with Express.js
* **SOAP Implementation:** `soap` (node-soap library)
* **Database:** MongoDB Atlas (Mongoose ODM) *(Initially built with in-memory array storage, later migrated for cloud persistence)*
* **Frontend:** Vanilla HTML5, CSS3, JavaScript (Native DOMParser & Fetch API)
* **Deployment:** Render (Cloud Hosting)

---

### 3. Architecture & Core Components

#### A. Single Deployment Architecture
A standout feature of this project is its monolithic deployment. We used **Express.js** as the central router for everything:
1. `app.use(express.static('public'))`: Intercepts and serves the frontend HTML/CSS/JS.
2. `app.use('/orders', restRoutes)`: Routes standard JSON API traffic to the REST controllers.
3. `soap.listen(server, '/wsdl', ...)`: Attaches the SOAP WSDL listener to the underlying HTTP server.
This allowed us to host the Frontend, the REST API, and the SOAP API on a **single port (8000)** and deploy it as a single web service on Render.

#### B. The Model Layer (`model/orderModel.js`)
* Defined a Mongoose Schema for Orders with strict validation (e.g., `enum` for delivery statuses).
* Created a custom counter collection to automatically generate human-readable IDs (`ORD1`, `ORD2`, etc.).
* Implemented unified async functions (`createOrder`, `getAllOrders`, `getOrderById`, `updateOrderStatus`, `cancelOrder`) that act as the single source of truth for the database.
* Modified the deletion behavior to completely wipe the record from the database using `findOneAndDelete` instead of simply updating the status.

#### C. The REST Layer (`rest/controller.js` & `rest/routes.js`)
* Created standard Express controllers handling JSON payloads.
* Mapped HTTP verbs (`POST`, `GET`, `PUT`, `DELETE`) to the corresponding Model functions.
* Implemented proper HTTP status codes (`200`, `201`, `400`, `404`, `500`) and simulated specialized error codes (`402` Payment Failure, `503` Restaurant Unavailable).

#### D. The SOAP Layer (`soap/service.wsdl` & `soap/soapService.js`)
* Authored a complete WSDL (Web Services Description Language) file defining schemas for:
  * `placeOrder`
  * `getOrderDetails`
  * `updateDeliveryStatus`
  * `cancelOrder`
* Created the Node.js mapping (`soapService.js`) that binds the WSDL operations to the exact same Model functions used by the REST controllers.

---

### 4. Frontend UI Redesign (Premium Dashboard)
The project initially lacked a frontend, relying on Postman and SoapUI. We later built a full, multi-page frontend testing suite directly into the application (`public/` directory).

* **Design:** Implemented a premium "glassmorphism" aesthetic with dark backgrounds, glowing gradients, and smooth CSS animations.
* **REST Tester (`rest.html`):** A dedicated interface to interact with the JSON endpoints.
* **SOAP Native Tester (`soap.html`):** 
  * Removed the requirement for SoapUI by building a native SOAP client in JavaScript.
  * Uses the browser's `fetch()` API to send raw `<soapenv:Envelope>` XML payloads to the `/wsdl` endpoint.
  * Uses the native `DOMParser` to parse the returning XML and format it beautifully in the browser console UI.

---

### 5. Deployment Journey (Render & MongoDB Atlas)

1. **Initial Deployment:**
   * Configured `package.json` with a `start` script (`node server.js`).
   * Modified the server to bind to `process.env.PORT` to comply with Render's dynamic port allocation.
2. **Database Migration:**
   * Transitioned from in-memory arrays to **MongoDB Atlas** for persistence.
   * Encountered an `ECONNREFUSED` error during deployment because Render was falling back to `localhost:27017`.
   * **Fix:** Injected the `MONGODB_URI` environment variable in the Render dashboard.
3. **Security Firewall (IP Whitelist):**
   * Encountered an Atlas connection rejection because Render's dynamic IPs were blocked.
   * **Fix:** Configured the MongoDB Atlas Network Access settings to whitelist `0.0.0.0/0` (Allow Access from Anywhere).

### 6. Conclusion
The resulting application is a highly scalable, full-stack Node.js application demonstrating advanced API interoperability. It proves that legacy enterprise protocols (SOAP) and modern architectures (REST/JSON) can not only coexist but share the exact same underlying logic, database, and single-server deployment environment.
