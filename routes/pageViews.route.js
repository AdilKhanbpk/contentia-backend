import express from "express";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";
import { getAnalyticsDashboardStats } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/dashboard-stats", isAuthenticated, getAnalyticsDashboardStats);

export default router;
