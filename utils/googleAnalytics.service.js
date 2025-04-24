import { BetaAnalyticsDataClient } from '@google-analytics/data';

const formatPrivateKey = (key) => {
    if (!key) return '';
    return key.replace(/\\n/g, '\n');
};

export const analyticsDataClient = new BetaAnalyticsDataClient({
    credentials: {
        client_email: process.env.GA_CLIENT_EMAIL,
        private_key: formatPrivateKey(process.env.GA_PRIVATE_KEY),
    },
});

