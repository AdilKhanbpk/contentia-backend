const express = require('express');
const multer = require('multer');
const path = require('path');
const { submitForm } = require('../../controllers/ugcBriefController/ugcBriefController'); // Adjust the path as necessary

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    // Set the destination for uploaded files
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../../uploads/'); // Use an absolute path
        cb(null, uploadPath); // Ensure this directory exists
    },
    // Generate a unique filename
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append the current timestamp to the filename
    }
});

// Create the multer upload middleware
const upload = multer({ storage });

// POST route to handle form submission
router.post('/ugcBrief', upload.single('file'), submitForm); // 'file' should match the field name in the frontend

module.exports = router;
