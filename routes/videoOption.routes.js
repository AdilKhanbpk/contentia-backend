import express from "express";
import { createVideoOption } from "../controllers/videoOption.controller.js";

const router = express.Router();

// POST request to create a new video option
router.post("/videoOptions", createVideoOption);

export default router;
