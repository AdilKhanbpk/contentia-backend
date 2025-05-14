import { analyticsDataClient } from "../utils/googleAnalytics.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

const propertyId = process.env.GA_PROPERTY_ID;

const safeGetMetricValue = (response, metricName) => {
    if (!response?.rows?.length || !response.rows[0]?.metricValues?.length) {
        console.log('No data found in response');
        return '0';
    }
    // Sum up all values across dates
    const total = response.rows.reduce((sum, row) => {
        const metricIndex = response.metricHeaders.findIndex(mh => mh.name === metricName);
        return sum + parseInt(row.metricValues[metricIndex]?.value || 0);
    }, 0);
    return total.toString();
};

const getEnhancedAnalytics = async (startDate, endDate) => {
    try {
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'screenPageViews' },
                { name: 'totalUsers' },
                { name: 'userEngagementDuration' },
                { name: 'engagedSessions' },
                { name: 'newUsers' }
            ],
            dimensions: [
                { name: 'date' },
                { name: 'country' },
                { name: 'deviceCategory' }
            ],
            orderBys: [
                {
                    metric: { metricName: 'screenPageViews' },
                    desc: true
                }
            ],
            limit: 1000
        });
        return response;
    } catch (error) {
        console.error('Error fetching enhanced analytics:', error.message);
        throw error;
    }
};

const getDashboardStats = async () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
    const formattedDate = thirtyDaysAgo.toISOString().split('T')[0];


    try {
        const analyticsData = await getEnhancedAnalytics(formattedDate, 'today');

        const stats = {
            overview: {
                pageViews: safeGetMetricValue(analyticsData, 'screenPageViews'),
                totalUsers: safeGetMetricValue(analyticsData, 'totalUsers'),
                newUsers: safeGetMetricValue(analyticsData, 'newUsers'),
                engagementDuration: formatDuration(safeGetMetricValue(analyticsData, 'userEngagementDuration')),
                engagedSessions: safeGetMetricValue(analyticsData, 'engagedSessions')
            },
            byDevice: processDeviceStats(analyticsData),
            byCountry: processCountryStats(analyticsData),
            trends: processTrendData(analyticsData)
        };

        return stats;
    } catch (error) {
        console.error('Error in getDashboardStats:', error.message);
        return {
            overview: {
                pageViews: '0',
                totalUsers: '0',
                newUsers: '0',
                engagementDuration: '0:00',
                engagedSessions: '0'
            },
            byDevice: {},
            byCountry: {},
            trends: []
        }; 
    }
};

export const getAnalyticsDashboardStats = asyncHandler(async (req, res) => {
    const stats = await getDashboardStats();
    if (!stats.overview.pageViews === '0' && stats.overview.totalUsers === '0') {
        throw new ApiError(404, "Analytics data not found");
    }
    return res.status(200).json(new ApiResponse(200, stats, "Analytics data retrieved successfully"));
});

// Helper functions for data processing
const processDeviceStats = (data) => {
    const deviceStats = {};
    data.rows?.forEach(row => {
        const device = row.dimensionValues[2]?.value; // deviceCategory is the third dimension
        if (device) {
            const pageViews = parseInt(row.metricValues[0]?.value || 0);
            deviceStats[device] = (deviceStats[device] || 0) + pageViews;
        }
    });
    return deviceStats;
};

const processCountryStats = (data) => {
    const countryStats = {};
    data.rows?.forEach(row => {
        const country = row.dimensionValues[1]?.value; // country is the second dimension
        if (country) {
            const pageViews = parseInt(row.metricValues[0]?.value || 0);
            countryStats[country] = (countryStats[country] || 0) + pageViews;
        }
    });
    return countryStats;
};

const processTrendData = (data) => {
    return data.rows?.reduce((acc, row) => {
        const date = row.dimensionValues[0]?.value; // date is the first dimension
        if (date) {
            acc.push({
                date,
                pageViews: parseInt(row.metricValues[0]?.value || 0),
                users: parseInt(row.metricValues[1]?.value || 0)
            });
        }
        return acc;
    }, []) || [];
};

// Utility functions for formatting
const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};




