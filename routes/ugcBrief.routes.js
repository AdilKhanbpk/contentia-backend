import express from "express";
import multer from "multer";
import path from "path";
import {
  createForm,
  getAllForms,
  deleteForm,
  getFormById,
  updateForm,
} from "../controllers/ugcBrief.controller.js"; // Adjust the path as necessary

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  // Set the destination for uploaded files
  destination: (req, file, cb) => {
    const uploadPath = path.join(path.resolve(), "uploads/"); // Use an absolute path
    cb(null, uploadPath); // Ensure this directory exists
  },
  // Generate a unique filename
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append the current timestamp to the filename
  },
});

// Create the multer upload middleware
const upload = multer({ storage });

// POST route to handle form submission
router.post("/ugcBrief", upload.single("file"), createForm); // 'file' should match the field name in the frontend

export default router;
