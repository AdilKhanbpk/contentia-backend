import express from "express";
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import ApiResponse from "../utils/ApiResponse.js";

const router = express.Router();

// Simple test endpoint to check Google Analytics credentials
router.get("/credentials", (req, res) => {
    const credentialsStatus = {
        GA_CLIENT_EMAIL: process.env.GA_CLIENT_EMAIL ? 'Set ✓' : 'Not set ✗',
        GA_PRIVATE_KEY: process.env.GA_PRIVATE_KEY ? 'Set ✓' : 'Not set ✗',
        GA_PROPERTY_ID: process.env.GA_PROPERTY_ID ? 'Set ✓' : 'Not set ✗',
        GA_MEASUREMENT_ID: process.env.GA_MEASUREMENT_ID ? 'Set ✓' : 'Not set ✗',
        allRequired: process.env.GA_CLIENT_EMAIL && 
                    process.env.GA_PRIVATE_KEY && 
                    process.env.GA_PROPERTY_ID ? 'Yes ✓' : 'No ✗'
    };
    
    return res.status(200).json(new ApiResponse(
        200,
        credentialsStatus,
        "Google Analytics credentials status"
    ));
});

// Test endpoint to make a direct API call to Google Analytics
router.get("/direct-test", async (req, res) => {
    try {
        console.log('\n=== DIRECT GOOGLE ANALYTICS API TEST ===');
        
        // Format private key
        const formatPrivateKey = (key) => {
            if (!key) return '';
            return key.replace(/\\n/g, '\n');
        };
        
        // Check if required credentials are present
        if (!process.env.GA_CLIENT_EMAIL || !process.env.GA_PRIVATE_KEY || !process.env.GA_PROPERTY_ID) {
            return res.status(400).json(new ApiResponse(
                400,
                {
                    GA_CLIENT_EMAIL: process.env.GA_CLIENT_EMAIL ? 'Set ✓' : 'Not set ✗',
                    GA_PRIVATE_KEY: process.env.GA_PRIVATE_KEY ? 'Set ✓' : 'Not set ✗',
                    GA_PROPERTY_ID: process.env.GA_PROPERTY_ID ? 'Set ✓' : 'Not set ✗'
                },
                "Google Analytics credentials are missing"
            ));
        }
        
        console.log('Creating Google Analytics client...');
        const analyticsDataClient = new BetaAnalyticsDataClient({
            credentials: {
                client_email: process.env.GA_CLIENT_EMAIL,
                private_key: formatPrivateKey(process.env.GA_PRIVATE_KEY),
            },
        });
        
        console.log('Client created successfully');
        
        // Get current date and 30 days ago
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const startDate = thirtyDaysAgo.toISOString().split('T')[0];
        const endDate = 'today';
        
        console.log(`Fetching data from ${startDate} to ${endDate}...`);
        
        // Make the API call
        const [response] = await analyticsDataClient.runReport({
            property: `properties/${process.env.GA_PROPERTY_ID}`,
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: 'screenPageViews' },
                { name: 'totalUsers' }
            ],
            dimensions: [
                { name: 'date' }
            ]
        });
        
        console.log('API call successful');
        
        // Process the response
        const result = {
            hasData: response.rows && response.rows.length > 0,
            rowCount: response.rows?.length || 0,
            metrics: {
                screenPageViews: 0,
                totalUsers: 0
            },
            dates: []
        };
        
        // Calculate totals
        if (response.rows && response.rows.length > 0) {
            response.rows.forEach(row => {
                const date = row.dimensionValues[0].value;
                const pageViews = parseInt(row.metricValues[0].value);
                const users = parseInt(row.metricValues[1].value);
                
                result.metrics.screenPageViews += pageViews;
                result.metrics.totalUsers += users;
                
                result.dates.push({
                    date,
                    pageViews,
                    users
                });
            });
        }
        
        return res.status(200).json(new ApiResponse(
            200,
            result,
            "Direct Google Analytics API test successful"
        ));
    } catch (error) {
        console.error('Error in direct Google Analytics API test:', error);
        
        return res.status(500).json(new ApiResponse(
            500,
            {
                error: error.message,
                stack: error.stack
            },
            "Direct Google Analytics API test failed"
        ));
    }
});

export default router;
