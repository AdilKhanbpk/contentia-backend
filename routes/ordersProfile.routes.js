import express from "express";
import {
  getUserWithProfile,
  updateOrdersProfile,
} from "../controllers/ordersProfile.controller.js";
import { protect } from "../controllers/auth.controller.js";

const router = express.Router();

router.use(protect); // Protect all routes

// Route to create or update OrdersProfile
router.patch("/update", updateOrdersProfile);

// Route to get user with OrdersProfile
router.get("/me", getUserWithProfile);

export default router;
