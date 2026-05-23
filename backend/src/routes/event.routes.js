const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');

router.get('/event-types', eventController.getAllEventTypes);
router.post('/event-types', eventController.createEventType);
router.delete('/event-types/:id', eventController.deleteEventType);

module.exports = router;