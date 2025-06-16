const express = require('express');
const router = express.Router();
const certificateController = require('../controllers/certificate.controller');
const controller = require('../controllers/certificate.controller');

// Generate and send certificate
router.post('/issue', certificateController.issueCertificate);

router.post('/generate', controller.generateCertificate);
router.get('/user/:userId/:courseId', controller.getUserCertificate);
router.get('/validate/:id', controller.validateCertificate);
router.get('/download/:id', controller.downloadCertificate);
router.get('/all', controller.getAllCertificates);
router.get('/stats', controller.certificateStats);

module.exports = router;


