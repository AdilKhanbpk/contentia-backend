import { BetaAnalyticsDataClient } from '@google-analytics/data';

const formatPrivateKey = (key) => {
    if (!key) return '';
    return key.replace(/\\n/g, '\n');
};

const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: formatPrivateKey(process.env.GA_PRIVATE_KEY),
    },
});
const propertyId = process.env.GA_PROPERTY_ID;

const safeGetMetricValue = (response) => {
    if (!response?.rows?.length || !response.rows[0]?.metricValues?.length) {
        return '0';
    }
    return response.rows[0].metricValues[0].value || '0';
};

export const getPageViews = async (startDate, endDate) => {
    try {
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
            // Add dimensions to ensure we get data
            dimensions: [
                {
                    name: 'date',
                },
            ],
        });
        return response;
    } catch (error) {
        console.error('Error fetching page views:', error);
        return { rows: [{ metricValues: [{ value: '0' }] }] };
    }
};

export const getTotalUsers = async (startDate, endDate) => {
    try {
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
                    name: 'totalUsers',
                },
            ],
            // Add dimensions to ensure we get data
            dimensions: [
                {
                    name: 'date',
                },
            ],
        });
        return response;
    } catch (error) {
        console.error('Error fetching total users:', error);
        return { rows: [{ metricValues: [{ value: '0' }] }] };
    }
};

export const getDashboardStats = async () => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30));
    const formattedDate = thirtyDaysAgo.toISOString().split('T')[0];

    try {
        const [pageViews, totalUsers] = await Promise.all([
            getPageViews(formattedDate, 'today'),
            getTotalUsers(formattedDate, 'today'),
        ]);

        return {
            pageViews: safeGetMetricValue(pageViews),
            totalUsers: safeGetMetricValue(totalUsers),
        };
    } catch (error) {
        console.error('Error fetching analytics:', error);
        return {
            pageViews: '0',
            totalUsers: '0',
        };
    }
};
