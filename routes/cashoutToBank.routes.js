const express = require('express');
const router = express.Router();
const { cashoutToBankController } = require('../controllers/cashoutToBank.controller');
const { protect } = require('../controllers/auth.controller');

// Define the cashout route
router.post('/cashoutToBank', protect, cashoutToBankController);

module.exports = router;
