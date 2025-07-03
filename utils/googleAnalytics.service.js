import { BetaAnalyticsDataClient } from '@google-analytics/data';

const formatPrivateKey = (key) => {
    if (!key) return '';
    return key.replace(/\\n/g, '\n');
};

// Check if required environment variables are set
const hasRequiredCredentials =
    process.env.GA_CLIENT_EMAIL &&
    process.env.GA_PRIVATE_KEY &&
    process.env.GA_PROPERTY_ID;

// Log the status of Google Analytics credentials
console.log('\n=== GOOGLE ANALYTICS CREDENTIALS STATUS ===');
console.log('- GA_CLIENT_EMAIL:', process.env.GA_CLIENT_EMAIL ? 'Set ✓' : 'Not set ✗');
console.log('- GA_PRIVATE_KEY:', process.env.GA_PRIVATE_KEY ? 'Set ✓' : 'Not set ✗');
console.log('- GA_PROPERTY_ID:', process.env.GA_PROPERTY_ID ? 'Set ✓' : 'Not set ✗');
console.log('- GA_MEASUREMENT_ID:', process.env.GA_MEASUREMENT_ID ? 'Set ✓' : 'Not set ✗');
console.log('All required credentials present:', hasRequiredCredentials ? 'Yes ✓' : 'No ✗');

// Create the analytics client
let analyticsDataClient;

try {
    if (!hasRequiredCredentials) {
        throw new Error('Google Analytics credentials are missing. Please check your environment variables.');
    }

    console.log('Initializing Google Analytics client with the following credentials:');
    console.log('- Client Email:', process.env.GA_CLIENT_EMAIL);
    console.log('- Property ID:', process.env.GA_PROPERTY_ID);

    analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: {
            client_email: process.env.GA_CLIENT_EMAIL,
            private_key: formatPrivateKey(process.env.GA_PRIVATE_KEY),
        },
    });

    console.log('Google Analytics client initialized successfully');
} catch (error) {
    console.error('\n=== GOOGLE ANALYTICS INITIALIZATION ERROR ===');
    console.error('Error type:', error.name);
    console.error('Error message:', error.message);

    if (error.stack) {
        console.error('Stack trace:');
        console.error(error.stack);
    }

    throw new Error(`Failed to initialize Google Analytics client: ${error.message}`);
}

// Export the client
export { analyticsDataClient };

