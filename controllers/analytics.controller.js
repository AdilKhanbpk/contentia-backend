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
        console.log('Fetching enhanced analytics with propertyId:', propertyId);
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'screenPageViews' },
                { name: 'activeUsers' },
                { name: 'averageSessionDuration' },
                { name: 'bounceRate' },
                { name: 'engagedSessions' },
                { name: 'totalRevenue' },
                { name: 'newUsers' }
            ],
            dimensions: [
                { name: 'date' },
                { name: 'country' },
                { name: 'deviceCategory' },
                { name: 'source' }
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

    console.log('Date range:', formattedDate, 'to today');

    try {
        const analyticsData = await getEnhancedAnalytics(formattedDate, 'today');

        // Process the data into meaningful statistics
        const stats = {
            overview: {
                pageViews: safeGetMetricValue(analyticsData, 'screenPageViews'),
                activeUsers: safeGetMetricValue(analyticsData, 'activeUsers'),
                newUsers: safeGetMetricValue(analyticsData, 'newUsers'),
                averageSessionDuration: formatDuration(safeGetMetricValue(analyticsData, 'averageSessionDuration')),
                bounceRate: formatPercentage(safeGetMetricValue(analyticsData, 'bounceRate')),
                engagedSessions: safeGetMetricValue(analyticsData, 'engagedSessions'),
                totalRevenue: formatCurrency(safeGetMetricValue(analyticsData, 'totalRevenue'))
            },
            byDevice: processDeviceStats(analyticsData),
            byCountry: processCountryStats(analyticsData),
            bySources: processSourceStats(analyticsData),
            trends: processTrendData(analyticsData)
        };

        console.log('Final enhanced stats:', stats);
        return stats;
    } catch (error) {
        console.error('Error in getDashboardStats:', error.message);
        return {
            overview: {
                pageViews: '0',
                activeUsers: '0',
                newUsers: '0',
                averageSessionDuration: '0:00',
                bounceRate: '0%',
                engagedSessions: '0',
                totalRevenue: '$0.00'
            },
            byDevice: {},
            byCountry: {},
            bySources: {},
            trends: []
        };
    }
};

export const getAnalyticsDashboardStats = asyncHandler(async (req, res) => {
    const stats = await getDashboardStats();
    if (!stats.overview.pageViews === '0' && stats.overview.activeUsers === '0') {
        throw new ApiError(404, "Analytics data not found");
    }
    return res.status(200).json(new ApiResponse(200, stats, "Analytics data retrieved successfully"));
});

// Helper functions for data processing
const processDeviceStats = (data) => {
    // Group and aggregate data by device category
    const deviceStats = {};
    data.rows?.forEach(row => {
        const device = row.dimensionValues.find(d => d.name === 'deviceCategory')?.value;
        if (device) {
            deviceStats[device] = (deviceStats[device] || 0) + parseInt(row.metricValues[0].value || 0);
        }
    });
    return deviceStats;
};

const processCountryStats = (data) => {
    // Group and aggregate data by country
    const countryStats = {};
    data.rows?.forEach(row => {
        const country = row.dimensionValues.find(d => d.name === 'country')?.value;
        if (country) {
            countryStats[country] = (countryStats[country] || 0) + parseInt(row.metricValues[0].value || 0);
        }
    });
    return countryStats;
};

const processSourceStats = (data) => {
    // Group and aggregate data by traffic source
    const sourceStats = {};
    data.rows?.forEach(row => {
        const source = row.dimensionValues.find(d => d.name === 'source')?.value;
        if (source) {
            sourceStats[source] = (sourceStats[source] || 0) + parseInt(row.metricValues[0].value || 0);
        }
    });
    return sourceStats;
};

const processTrendData = (data) => {
    // Process daily trends
    return data.rows?.reduce((acc, row) => {
        const date = row.dimensionValues.find(d => d.name === 'date')?.value;
        if (date) {
            acc.push({
                date,
                pageViews: parseInt(row.metricValues[0].value || 0),
                activeUsers: parseInt(row.metricValues[1].value || 0)
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

const formatPercentage = (value) => `${(parseFloat(value) * 100).toFixed(2)}%`;

const formatCurrency = (value) => `$${parseFloat(value).toFixed(2)}`;


