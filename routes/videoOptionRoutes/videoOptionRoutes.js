// routes/videoOptions.js
const express = require('express');
const router = express.Router();
const videoOptionsController = require('../../controllers/videoOptionController/videoOptionController');

// POST request to create a new video option
router.post('/videoOptions', videoOptionsController.createVideoOption);

module.exports = router;
