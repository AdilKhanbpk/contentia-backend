import express from "express";
import {
  getUserWithProfile,
  updateOrdersProfile,
} from "../controllers/ordersProfile.controller.js";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";

const router = express.Router();

// Route to create or update OrdersProfile
router.patch("/update", updateOrdersProfile);

// Route to get user with OrdersProfile
router.get("/me", getUserWithProfile);

export default router;
