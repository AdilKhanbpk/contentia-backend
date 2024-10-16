// routes/contentRoutes.js
const express = require('express');
const router = express.Router();
const contentController = require('../controllers/preferences.controller');

// Create new content
router.post('/preferencesRoute', contentController.createContent);

// Export the router
module.exports = router;
