import express from "express";
import { createContent } from "../controllers/preferences.controller.js";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";

const router = express.Router();

// Create new content
router.post("/preferencesRoute", createContent);

// Export the router
export default router;
