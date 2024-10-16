const express = require('express');
const becomeCreatorController = require('../controllers/becomeCreator.controller')
const { protect } = require('../controllers/auth.controller');

const router = express.Router();

// router.use(protect); 

// Route to create or update OrdersProfile
router.post('/create', becomeCreatorController.addBecomeCreator);

module.exports = router;
