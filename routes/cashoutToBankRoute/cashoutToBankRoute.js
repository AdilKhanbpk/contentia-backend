const express = require('express');
const router = express.Router();
const { cashoutToBankController } = require('../../controllers/cashoutToBankController/cashoutToBankController');
const { protect } = require('../../controllers/userAuthControllers/authController');

// Define the cashout route
router.post('/cashoutToBank', protect, cashoutToBankController);

module.exports = router;
