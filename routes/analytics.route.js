import express from "express";
import { getDashboardStats } from "../controllers/analytics.controller.js";
import ApiResponse from "../utils/ApiResponse.js";

const router = express.Router();

// Simple test endpoint that doesn't require authentication
router.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Analytics route is working correctly"
    });
});

// Get analytics data without authentication (for testing)
router.get("/", async (req, res) => {
    try {
        // Default to currentMonth
        const period = req.query.period || 'currentMonth';
        const stats = await getDashboardStats(period);
        
        // Format the data for the dashboard boxes
        const formattedData = {
            totalPageViews: parseInt(stats.overview.pageViews).toLocaleString(),
            totalUsers: parseInt(stats.overview.totalUsers).toLocaleString(),
            rawData: {
                pageViews: parseInt(stats.overview.pageViews),
                totalUsers: parseInt(stats.overview.totalUsers)
            },
            period: {
                startDate: stats.period.startDate,
                endDate: stats.period.endDate,
                label: period === 'currentMonth' ? 'Current Month' : period
            },
            description: {
                totalPageViews: "Total Page Views by users in the current month (If one user visits more than once, it shows the total views & traffic)",
                totalUsers: "Number of Total Users in the current month → Total Users are the number of users who visited the platform. They are not customers but total user traffic of the website"
            }
        };
        
        return res.status(200).json(new ApiResponse(
            200, 
            formattedData, 
            "Analytics data retrieved successfully"
        ));
    } catch (error) {
        console.error("Error fetching analytics data:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to retrieve analytics data",
            error: error.message
        });
    }
});

// Get mock analytics data (for testing when GA is not configured)
router.get("/mock", (req, res) => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const mockData = {
        totalPageViews: "1,234",
        totalUsers: "567",
        rawData: {
            pageViews: 1234,
            totalUsers: 567
        },
        period: {
            startDate: firstDayOfMonth.toISOString().split('T')[0],
            endDate: today.toISOString().split('T')[0],
            label: "Current Month"
        },
        description: {
            totalPageViews: "Total Page Views by users in the current month (If one user visits more than once, it shows the total views & traffic)",
            totalUsers: "Number of Total Users in the current month → Total Users are the number of users who visited the platform. They are not customers but total user traffic of the website"
        }
    };
    
    return res.status(200).json(new ApiResponse(
        200, 
        mockData, 
        "Mock analytics data retrieved successfully"
    ));
});

export default router;
