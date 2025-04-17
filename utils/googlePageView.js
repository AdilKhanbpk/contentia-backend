import { google } from 'googleapis';
import fs from 'fs';
import { resolvePath } from './commonHelpers.js';
import asyncHandler from './asyncHandler.js';
import ApiResponse from './ApiResponse.js';

const SERVICE_ACCOUNT_FILE = resolvePath("../analyticsConfig.json");
const credentials = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_FILE, 'utf8'));
const scopes = 'https://www.googleapis.com/auth/analytics.readonly';

const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: scopes,
});

const analytics = google.analyticsdata('v1beta');
const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;

export const getPageViews = asyncHandler(async (req, res) => {

    const { startDate, endDate } = req.query;
    const authClient = await auth.getClient();

    const dateRange = {
        startDate: startDate || '2023-01-01',
        endDate: endDate || 'today',
    };

    const response = await analytics.properties.runReport({
        property: `properties/${propertyId}`,
        requestBody: {
            dimensions: [{ name: 'pagePath' }],
            metrics: [{ name: 'screenPageViews' }],
            dateRanges: [dateRange],
        },
        auth: authClient,
    });

    res.status(200).json(new ApiResponse(200, response.data, "Page views retrieved successfully"));

});

