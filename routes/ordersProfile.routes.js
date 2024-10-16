const express = require('express');
const ordersProfileController = require('../controllers/ordersProfile.controller');
const { protect } = require('../controllers/auth.controller');

const router = express.Router();

router.use(protect); // Protect all routes

// Route to create or update OrdersProfile
router.patch('/update', ordersProfileController.updateOrdersProfile);

// Route to get user with OrdersProfile
router.get('/me', ordersProfileController.getUserWithProfile);

module.exports = router;
