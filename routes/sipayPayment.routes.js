// backend/routes/paymentRoutes.js
const express = require('express');
const sipayPaymentController = require('../controllers/sipayPayment.controller'); // Import the controller
const { protect } = require('../controllers/auth.controller');

const router = express.Router();

// Route to process payment
router.post('/payment', protect, sipayPaymentController.processPayment); // Use the controller function

module.exports = router;
