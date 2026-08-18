const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const restRoutes = require('./rest/routes');

const app = express();

// Render requires binding to process.env.PORT
const PORT = process.env.PORT || 8000;

// MongoDB connection string — set via environment variable or default to local
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/food-delivery';

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

// Connect to MongoDB first, then start the server
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB successfully');

    const server = app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
