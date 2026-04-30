const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const soap = require('soap');
const path = require('path');
const mongoose = require('mongoose');
const restRoutes = require('./rest/routes');
const soapService = require('./soap/soapService');

const app = express();

// Render requires binding to process.env.PORT
const PORT = process.env.PORT || 8000;

// MongoDB connection string — set via environment variable or default to local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food-delivery';

app.use(bodyParser.json());

// Serve the static test UI
app.use(express.static(path.join(__dirname, 'public')));

// Attach REST Routes
app.use('/orders', restRoutes);

// Error Handling Middleware for REST APIs
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    status: status
  });
});

// Connect to MongoDB first, then start the server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);

      // Attach SOAP Service to /wsdl endpoint
      const wsdlPath = path.join(__dirname, 'soap', 'service.wsdl');
      const wsdlXML = fs.readFileSync(wsdlPath, 'utf8');

      soap.listen(server, '/wsdl', soapService, wsdlXML, function () {
        console.log('SOAP service listening on /wsdl');
      });
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
