import express from "express";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";
import {
    getAnalyticsDashboardStats,
    getCurrentMonthAnalytics
} from "../controllers/analytics.controller.js";

const router = express.Router();

// Get full analytics dashboard stats (with optional period parameter)
router.get("/dashboard-stats", isAuthenticated, getAnalyticsDashboardStats);

// Get current month analytics specifically for dashboard boxes
router.get("/current-month", isAuthenticated, getCurrentMonthAnalytics);

export default router;
