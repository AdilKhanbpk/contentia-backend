import express from "express";
import { createCreator } from "../controllers/creator.controller.js";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";

const router = express.Router();

// Route to create or update OrdersProfile
router.post("/create", isAuthenticated, createCreator);

export default router;
