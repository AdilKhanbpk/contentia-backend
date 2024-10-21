import express from "express";
import { createContent } from "../controllers/preferences.controller.js";

const router = express.Router();

// Create new content
router.post("/preferencesRoute", createContent);

// Export the router
export default router;
