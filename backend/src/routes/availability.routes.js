const express = require('express');
const router = express.Router();
const availabilityController = require('../controllers/availability.controller');

router.get('/availability', availabilityController.getAvailability);
router.put('/availability', availabilityController.updateAvailability);

module.exports = router;