import express from "express";
import {
    isAdmin,
    isAuthenticated,
} from "../../middlewares/authentication.middleware.js";
import {
    getTotalCreators,
    getTotalOrders,
    getTotalPlatformRevenue,
    getTotalSales,
    getTotalUsers,
    getTotalUsersForCurrentMonth,
    recentOrders,
} from "../../controllers/admin/adminDashboard.controller.js";

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(isAuthenticated, isAdmin);

// GET Routes
router.get("/total-creators", getTotalCreators);
router.get("/total-orders", getTotalOrders);
router.get("/total-customers", getTotalUsers);
router.get("/recent-orders", recentOrders);
router.get("/total-sales-by-month", getTotalSales);
router.get("/total-revenue-by-month", getTotalPlatformRevenue);
router.get("/total-users-for-current-month", getTotalUsersForCurrentMonth);

export default router;
