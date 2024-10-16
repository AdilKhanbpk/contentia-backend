// routes/videoOptions.js
const express = require('express');
const videoOptionsController = require('../controllers/videoOption.controller');

const router = express.Router();

// POST request to create a new video option
router.post('/videoOptions', videoOptionsController.createVideoOption);

module.exports = router;
