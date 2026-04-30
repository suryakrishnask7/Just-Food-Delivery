const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const soap = require('soap');
const path = require('path');
const restRoutes = require('./rest/routes');
const soapService = require('./soap/soapService');

const app = express();

// Render requires binding to process.env.PORT
const PORT = process.env.PORT || 8000;

app.use(bodyParser.json());

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

// Start the Express server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
  // Attach SOAP Service to /wsdl endpoint
  const wsdlPath = path.join(__dirname, 'soap', 'service.wsdl');
  const wsdlXML = fs.readFileSync(wsdlPath, 'utf8');
  
  soap.listen(server, '/wsdl', soapService, wsdlXML, function() {
    console.log(`SOAP service listening on /wsdl`);
  });
});

// KEEP-ALIVE: Prevent Node from exiting due to event loop emptying
setInterval(() => {}, 1000 * 60 * 60);
