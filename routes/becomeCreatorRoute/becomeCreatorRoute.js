const express = require('express');
const becomeCreatorController = require('../../controllers/becomeCreatorController/becomeCreatorController')
const { protect } = require('../../controllers/userAuthControllers/authController');

const router = express.Router();

// router.use(protect); 

// Route to create or update OrdersProfile
router.post('/create', becomeCreatorController.addBecomeCreator);

module.exports = router;
