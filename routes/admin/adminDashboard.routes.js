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
    getGoogleAnalyticsData,
    testAdminAuth
} from "../../controllers/admin/adminDashboard.controller.js";

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(isAuthenticated, isAdmin);

// GET Routes
router.get("/test-auth", testAdminAuth); // Test endpoint for admin authentication
router.get("/total-creators", getTotalCreators);
router.get("/total-orders", getTotalOrders);
router.get("/total-customers", getTotalUsers);
router.get("/recent-orders", recentOrders);
router.get("/total-sales-by-month", getTotalSales);
router.get("/total-revenue-by-month", getTotalPlatformRevenue);
router.get("/total-users-for-current-month", getTotalUsersForCurrentMonth);
router.get("/google-analytics", getGoogleAnalyticsData);

// Simple test endpoint for Google Analytics data
router.get("/analytics-test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Analytics test endpoint is working",
        data: {
            totalPageViews: "1,234",
            totalUsers: "567",
            period: {
                label: "Current Month",
                startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                endDate: new Date().toISOString().split('T')[0]
            },
            description: {
                totalPageViews: "Total Page Views by users in the current month (If one user visits more than once, it shows the total views & traffic)",
                totalUsers: "Number of Total Users in the current month → Total Users are the number of users who visited the platform. They are not customers but total user traffic of the website"
            }
        }
    });
});

export default router;
