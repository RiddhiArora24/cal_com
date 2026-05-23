const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');

router.post('/bookings', bookingController.createBooking);
router.get('/bookings', bookingController.getAllBookings);
router.delete('/bookings/:id', bookingController.cancelBooking);

module.exports = router;