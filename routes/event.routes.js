const express = require('express');
const router = express.Router();
const eventController = require('../controllers/event.controller');

router.post('/create', eventController.createEvent);
router.get('/', eventController.getAllEvents);
router.get('/stats', eventController.eventStats);
router.get('/:id', eventController.getEventById);
router.put('/:id', eventController.updateEvent);
router.delete('/:id', eventController.deleteEvent);
router.post('/register', eventController.registerForEvent);

module.exports = router;
