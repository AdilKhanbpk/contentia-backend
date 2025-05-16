import { analyticsDataClient } from "../utils/googleAnalytics.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";

// Use a default property ID if the environment variable is not set
const propertyId = process.env.GA_PROPERTY_ID || 'mock-property-id';

const safeGetMetricValue = (response, metricName) => {
    // Check if response has rows and metricValues
    if (!response?.rows?.length || !response.rows[0]?.metricValues?.length) {
        console.log('No data found in response for metric:', metricName);
        return '0';
    }

    try {
        // Find the index of the metric in the metricHeaders array
        const metricIndex = response.metricHeaders.findIndex(mh => mh.name === metricName);

        if (metricIndex === -1) {
            console.log(`Metric ${metricName} not found in headers:`, response.metricHeaders);
            return '0';
        }

        console.log(`Found metric ${metricName} at index ${metricIndex}`);

        // Sum up all values across dates
        const total = response.rows.reduce((sum, row) => {
            if (!row.metricValues || !row.metricValues[metricIndex]) {
                console.log(`No metric value at index ${metricIndex} for row:`, row);
                return sum;
            }

            const value = parseInt(row.metricValues[metricIndex].value || 0);
            console.log(`Adding value ${value} for metric ${metricName}`);
            return sum + value;
        }, 0);

        console.log(`Total for metric ${metricName}: ${total}`);
        return total.toString();
    } catch (error) {
        console.error(`Error calculating metric ${metricName}:`, error);
        return '0';
    }
};

const getEnhancedAnalytics = async (startDate, endDate) => {
    try {
        console.log(`=== GOOGLE ANALYTICS API REQUEST ===`);
        console.log(`Date Range: ${startDate} to ${endDate}`);
        console.log(`Property ID: ${propertyId}`);

        // Check if Google Analytics is configured
        if (!process.env.GA_CLIENT_EMAIL || !process.env.GA_PRIVATE_KEY || !process.env.GA_PROPERTY_ID) {
            console.error('ERROR: Google Analytics credentials are not configured.');
            console.error('Please set GA_CLIENT_EMAIL, GA_PRIVATE_KEY, and GA_PROPERTY_ID in your .env file.');
            throw new Error('Google Analytics credentials not configured');
        }

        // Make the API call to Google Analytics
        console.log('Sending request to Google Analytics API...');

        const requestBody = {
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
                    dimension: { dimensionName: 'date' },
                    desc: false
                }
            ],
            limit: 1000
        };

        console.log('Request body:', JSON.stringify(requestBody, null, 2));

        const [response] = await analyticsDataClient.runReport(requestBody);

        console.log('=== GOOGLE ANALYTICS API RESPONSE ===');

        // Log detailed response information
        if (response.rows && response.rows.length > 0) {
            console.log(`SUCCESS: Received ${response.rows.length} rows of data`);

            // Log the first row as an example
            console.log('Sample row data:');
            console.log(JSON.stringify(response.rows[0], null, 2));

            // Log metric totals
            const metricTotals = {};
            response.metricHeaders.forEach((header, index) => {
                const total = response.rows.reduce((sum, row) => {
                    return sum + parseInt(row.metricValues[index]?.value || 0);
                }, 0);
                metricTotals[header.name] = total;
            });

            console.log('Metric totals:');
            console.log(JSON.stringify(metricTotals, null, 2));
        } else {
            console.log('WARNING: No data rows returned from Google Analytics');
            console.log('Response structure:');
            console.log(JSON.stringify({
                metricHeaders: response.metricHeaders || [],
                dimensionHeaders: response.dimensionHeaders || []
            }, null, 2));
        }

        return response;
    } catch (error) {
        console.error('=== GOOGLE ANALYTICS API ERROR ===');
        console.error(`Error type: ${error.name}`);
        console.error(`Error message: ${error.message}`);

        if (error.stack) {
            console.error('Stack trace:');
            console.error(error.stack);
        }

        if (error.details) {
            console.error('Error details:');
            console.error(JSON.stringify(error.details, null, 2));
        }

        // Throw the error to be handled by the caller
        throw error;
    }
};

export const getDashboardStats = async (period = 'last30days') => {
    console.log(`\n=== GETTING DASHBOARD STATS FOR PERIOD: ${period} ===`);

    let startDate;
    let endDate = 'today';
    const today = new Date();

    // Determine the date range based on the period
    if (period === 'currentMonth') {
        // First day of current month
        startDate = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        console.log(`Current month period: ${startDate} to today`);
    } else if (period === 'last30days') {
        // Last 30 days
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        startDate = thirtyDaysAgo.toISOString().split('T')[0];
        console.log(`Last 30 days period: ${startDate} to today`);
    } else if (period === 'lastMonth') {
        // Last month
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        startDate = firstDayLastMonth.toISOString().split('T')[0];
        endDate = lastDayLastMonth.toISOString().split('T')[0];
        console.log(`Last month period: ${startDate} to ${endDate}`);
    } else {
        console.log(`Unknown period: ${period}, defaulting to last 30 days`);
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        startDate = thirtyDaysAgo.toISOString().split('T')[0];
    }

    try {
        console.log(`Fetching analytics data for period: ${period}`);
        const analyticsData = await getEnhancedAnalytics(startDate, endDate);

        console.log(`Processing analytics data for dashboard...`);

        // Extract metrics for overview
        const pageViews = safeGetMetricValue(analyticsData, 'screenPageViews');
        const totalUsers = safeGetMetricValue(analyticsData, 'totalUsers');
        const newUsers = safeGetMetricValue(analyticsData, 'newUsers');
        const engagementDuration = formatDuration(safeGetMetricValue(analyticsData, 'userEngagementDuration'));
        const engagedSessions = safeGetMetricValue(analyticsData, 'engagedSessions');

        console.log(`Overview metrics extracted:
- Page Views: ${pageViews}
- Total Users: ${totalUsers}
- New Users: ${newUsers}
- Engagement Duration: ${engagementDuration}
- Engaged Sessions: ${engagedSessions}`);

        // Process device stats
        const deviceStats = {};
        if (analyticsData.rows && analyticsData.rows.length > 0) {
            analyticsData.rows.forEach(row => {
                const device = row.dimensionValues[2]?.value; // deviceCategory is the third dimension
                if (device) {
                    const pageViews = parseInt(row.metricValues[0]?.value || 0);
                    deviceStats[device] = (deviceStats[device] || 0) + pageViews;
                }
            });
        }
        console.log(`Device stats processed: ${JSON.stringify(deviceStats)}`);

        // Process country stats
        const countryStats = {};
        if (analyticsData.rows && analyticsData.rows.length > 0) {
            analyticsData.rows.forEach(row => {
                const country = row.dimensionValues[1]?.value; // country is the second dimension
                if (country) {
                    const pageViews = parseInt(row.metricValues[0]?.value || 0);
                    countryStats[country] = (countryStats[country] || 0) + pageViews;
                }
            });
        }
        console.log(`Country stats processed: ${Object.keys(countryStats).length} countries`);

        // Process trend data
        const trendData = [];
        if (analyticsData.rows && analyticsData.rows.length > 0) {
            // Group by date
            const dateGroups = {};
            analyticsData.rows.forEach(row => {
                const date = row.dimensionValues[0]?.value; // date is the first dimension
                if (date) {
                    if (!dateGroups[date]) {
                        dateGroups[date] = {
                            pageViews: 0,
                            users: 0
                        };
                    }
                    dateGroups[date].pageViews += parseInt(row.metricValues[0]?.value || 0);
                    dateGroups[date].users += parseInt(row.metricValues[1]?.value || 0);
                }
            });

            // Convert to array
            for (const date in dateGroups) {
                trendData.push({
                    date,
                    pageViews: dateGroups[date].pageViews,
                    users: dateGroups[date].users
                });
            }

            // Sort by date
            trendData.sort((a, b) => a.date.localeCompare(b.date));
        }
        console.log(`Trend data processed: ${trendData.length} days`);

        const stats = {
            overview: {
                pageViews,
                totalUsers,
                newUsers,
                engagementDuration,
                engagedSessions
            },
            byDevice: deviceStats,
            byCountry: countryStats,
            trends: trendData,
            period: {
                startDate,
                endDate: endDate === 'today' ? new Date().toISOString().split('T')[0] : endDate,
                label: period
            }
        };

        console.log(`Dashboard stats successfully processed`);
        return stats;
    } catch (error) {
        console.error(`=== ERROR IN getDashboardStats FOR PERIOD ${period} ===`);
        console.error(`Error message: ${error.message}`);

        // Throw the error to be handled by the controller
        throw new Error(`Failed to get analytics data: ${error.message}`);
    }
};

export const getAnalyticsDashboardStats = asyncHandler(async (req, res) => {
    try {
        // Default to currentMonth instead of last30days to meet client requirements
        const { period = 'currentMonth' } = req.query;
        console.log(`\n=== ANALYTICS DASHBOARD STATS REQUEST ===`);
        console.log(`Requested period: ${period}`);

        const stats = await getDashboardStats(period);

        console.log(`Analytics dashboard stats successfully retrieved`);
        return res.status(200).json(new ApiResponse(200, stats, "Analytics data retrieved successfully"));
    } catch (error) {
        console.error(`Error in getAnalyticsDashboardStats:`, error);
        throw new ApiError(500, `Failed to retrieve analytics data: ${error.message}`);
    }
});

// New endpoint specifically for current month analytics
export const getCurrentMonthAnalytics = asyncHandler(async (_req, res) => {
    try {
        console.log(`\n=== CURRENT MONTH ANALYTICS REQUEST ===`);

        const stats = await getDashboardStats('currentMonth');

        // Format the data for the dashboard boxes
        // Client specifically requested Total Page Views and Total Users for the current month
        const formattedData = {
            totalPageViews: parseInt(stats.overview.pageViews).toLocaleString(),
            totalUsers: parseInt(stats.overview.totalUsers).toLocaleString(),
            // Include raw values for calculations if needed
            rawData: {
                pageViews: parseInt(stats.overview.pageViews),
                totalUsers: parseInt(stats.overview.totalUsers)
            },
            period: {
                startDate: stats.period.startDate,
                endDate: stats.period.endDate,
                label: 'Current Month'
            },
            description: {
                totalPageViews: "Total Page Views by users in the current month (If one user visits more than once, it shows the total views & traffic)",
                totalUsers: "Number of Total Users in the current month → Total Users are the number of users who visited the platform. They are not customers but total user traffic of the website"
            }
        };

        console.log(`Current month analytics data successfully formatted:
- Total Page Views: ${formattedData.totalPageViews}
- Total Users: ${formattedData.totalUsers}
- Period: ${formattedData.period.startDate} to ${formattedData.period.endDate}`);

        return res.status(200).json(new ApiResponse(
            200,
            formattedData,
            "Current month analytics data retrieved successfully"
        ));
    } catch (error) {
        console.error(`Error in getCurrentMonthAnalytics:`, error);
        throw new ApiError(500, `Failed to retrieve current month analytics data: ${error.message}`);
    }
});

// Utility functions for formatting
const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};




