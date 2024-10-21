import express from "express";
import { addBecomeCreator } from "../controllers/becomeCreator.controller.js";
import { protect } from "../controllers/auth.controller.js";

const router = express.Router();

// router.use(protect);

// Route to create or update OrdersProfile
router.post("/create", addBecomeCreator);

export default router;
