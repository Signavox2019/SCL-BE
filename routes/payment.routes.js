const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');

router.post('/create', paymentController.createOrder);
router.post('/verify', paymentController.verifyPayment);
router.get('/all', paymentController.getAllPayments); // Admin route

module.exports = router;
