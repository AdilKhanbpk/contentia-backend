// routes/contentRoutes.js
const express = require('express');
const router = express.Router();
const contentController = require('../../controllers/preferencesController/preferencesController');

// Create new content
router.post('/preferencesRoute', contentController.createContent);

// Export the router
module.exports = router;
