const express = require('express');
const ordersProfileController = require('../../controllers/ordersProfileController/ordersProfileController');
const { protect } = require('../../controllers/userAuthControllers/authController');

const router = express.Router();

router.use(protect); // Protect all routes

// Route to create or update OrdersProfile
router.patch('/update', ordersProfileController.updateOrdersProfile);

// Route to get user with OrdersProfile
router.get('/me', ordersProfileController.getUserWithProfile);

module.exports = router;
