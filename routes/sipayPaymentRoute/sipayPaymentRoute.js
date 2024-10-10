// backend/routes/paymentRoutes.js
const express = require('express');
const sipayPaymentController = require('../../controllers/sipayPaymentController/sipayPaymentController'); // Import the controller
const { protect } = require('../../controllers/userAuthControllers/authController');

const router = express.Router();

router.post('/payment',protect, sipayPaymentController.processPayment); // Use the controller function

module.exports = router;
