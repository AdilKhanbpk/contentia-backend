import { analyticsDataClient } from "../utils/googleAnalytics.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const propertyId = process.env.GA_PROPERTY_ID;

const safeGetMetricValue = (response) => {
    if (!response?.rows?.length || !response.rows[0]?.metricValues?.length) {
        console.log('No data found in response');
        return '0';
    }
    // Sum up all values across dates
    const total = response.rows.reduce((sum, row) => {
        return sum + parseInt(row.metricValues[0].value || 0);
    }, 0);
    return total.toString();
};

const getPageViews = async (startDate, endDate) => {
    try {
        console.log('Fetching pageviews with propertyId:', propertyId);
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [
                {
                    startDate,
                    endDate,
                },
            ],
            metrics: [
                {
                    name: 'screenPageViews',
                },
            ],
            dimensions: [
                {
                    name: 'date',
                },
            ],
            keepEmptyRows: true
        });
        console.log('Page Views Response:', JSON.stringify(response, null, 2));
        return response;
    } catch (error) {
        console.error('Error fetching page views:', error.message);
        throw error;
    }
};

const getTotalUsers = async (startDate, endDate) => {
    try {
        console.log('Fetching users with propertyId:', propertyId);
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [
                {
                    startDate,
                    endDate,
                },
            ],
            metrics: [
                {
                    name: 'activeUsers',  // Changed from totalUsers to activeUsers
                },
            ],
            dimensions: [
                {
                    name: 'date',
                },
            ],
            keepEmptyRows: true
        });
        console.log('Total Users Response:', JSON.stringify(response, null, 2));
        return response;
    } catch (error) {
        console.error('Error fetching total users:', error.message);
        throw error;
    }
};

const getDashboardStats = async () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
    const formattedDate = thirtyDaysAgo.toISOString().split('T')[0];

    console.log('Date range:', formattedDate, 'to today');

    try {
        const [pageViews, totalUsers] = await Promise.all([
            getPageViews(formattedDate, 'today'),
            getTotalUsers(formattedDate, 'today'),
        ]);

        const stats = {
            pageViews: safeGetMetricValue(pageViews),
            totalUsers: safeGetMetricValue(totalUsers),
        };

        console.log('Final stats:', stats);
        return stats;
    } catch (error) {
        console.error('Error in getDashboardStats:', error.message);
        return {
            pageViews: '0',
            totalUsers: '0',
        };
    }
};

export const getAnalyticsDashboardStats = asyncHandler(async (req, res) => {
    const stats = await getDashboardStats();
    if (!stats) {
        throw new ApiError(404, "Analytics data not found");
    }
    return res.status(200).json(new ApiResponse(200, stats, "Analytics data retrieved successfully"));
});


