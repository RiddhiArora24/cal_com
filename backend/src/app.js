const express = require('express');
const cors = require('cors');
const eventRoutes = require('./routes/event.routes');
const bookingRoutes = require('./routes/booking.routes');
const availabilityRoutes = require('./routes/availability.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main Root API Mapping
app.use('/api', eventRoutes);
app.use('/api', bookingRoutes);
app.use('/api', availabilityRoutes);

// Fallback Global Health Check Route
app.get('/health', (req, res) => res.status(200).json({ status: 'healthy' }));

module.exports = app;