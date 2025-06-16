const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

router.post('/create', notificationController.createNotification);
router.get('/user/:userId', notificationController.getNotificationsByUser);
router.put('/mark-read/:notificationId', notificationController.markAsRead);
router.delete('/:id', notificationController.deleteNotification);
router.get('/stats/:userId', notificationController.notificationStats);

module.exports = router;
