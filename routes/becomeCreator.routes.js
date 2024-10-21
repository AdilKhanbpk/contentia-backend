import express from "express";
import { addBecomeCreator } from "../controllers/becomeCreator.controller.js";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";

const router = express.Router();

// Route to create or update OrdersProfile
router.post("/create", addBecomeCreator);

export default router;
