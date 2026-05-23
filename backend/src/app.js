const express = require('express');
const cors = require('cors');
const eventRoutes = require('./routes/event.routes');
const bookingRoutes = require('./routes/booking.routes');
const availabilityRoutes = require('./routes/availability.routes');

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

app.use('/api', eventRoutes);
app.use('/api', bookingRoutes);
app.use('/api', availabilityRoutes);


app.get('/health', (req, res) => res.status(200).json({ status: 'healthy' }));

module.exports = app;