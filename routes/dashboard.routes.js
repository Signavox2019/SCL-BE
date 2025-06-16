const express = require('express');
const router = express.Router();
const controller = require('../controllers/dashboard.controller');

router.get('/:userId', controller.getDashboardData);
router.post('/update', controller.updateProgress);
router.get('/stats/:userId', controller.getProgressStats);

module.exports = router;
