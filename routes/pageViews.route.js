import express from "express";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";
import {
    getPageViews,
    getDailyActiveUsers,
    getTopPages,
    getEventCounts,
    getConversionsBySource,
} from "../utils/googlePageView.js"; // or rename to analyticsController.js if needed

const router = express.Router();

// GET Routes
router.get("/page-views", isAuthenticated, getPageViews);
router.get("/daily-active-users", isAuthenticated, getDailyActiveUsers);
router.get("/top-pages", isAuthenticated, getTopPages);
router.get("/event-counts", isAuthenticated, getEventCounts);
router.get("/conversions-by-source", isAuthenticated, getConversionsBySource);

export default router;
