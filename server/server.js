const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const restRoutes = require('./rest/routes');

const app = express();

// Render requires binding to process.env.PORT
const PORT = process.env.PORT || 8000;

// Allow React dev server (port 5173) and any other origin in development
app.use(cors());
app.use(bodyParser.json());

// Serve built React frontend in production (client/ is a sibling of server/)
app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));

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

// Start the server directly with SQLite
app.listen(PORT, () => {
  console.log('Connected to SQLite database successfully');
  console.log(`Server is running on port ${PORT}`);
});

