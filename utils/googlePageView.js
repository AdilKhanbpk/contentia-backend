import ApiError from "./ApiError.js";
import ApiResponse from "./ApiResponse.js";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import asyncHandler from "./asyncHandler.js";

const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
const analyticsDataClient = new BetaAnalyticsDataClient();

// 1. Page views by city
export const getPageViews = asyncHandler(async (req, res) => {
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [
            {
                startDate: '30daysAgo',
                endDate: 'today',
            },
        ],
        dimensions: [
            {
                name: 'city',
            },
        ],
        metrics: [
            {
                name: 'activeUsers',
            },
        ],
    });

    console.log('Page views by city:');
    response.rows?.forEach(row => {
        console.log(row.dimensionValues[0], row.metricValues[0]);
    });

    return res.status(200).json(new ApiResponse(200, response, "Page views retrieved successfully"));
});

// 2. Daily active users
export const getDailyActiveUsers = asyncHandler(async (req, res) => {
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'activeUsers' }],
    });

    console.log('Daily active users:');
    response.rows?.forEach(row => {
        console.log(row.dimensionValues[0], row.metricValues[0]);
    });

    return res.status(200).json(new ApiResponse(200, response, "Daily active users retrieved"));
});

// 3. Top pages
export const getTopPages = asyncHandler(async (req, res) => {
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10,
    });

    console.log('Top pages:');
    response.rows?.forEach(row => {
        console.log(row.dimensionValues[0], row.metricValues[0]);
    });

    return res.status(200).json(new ApiResponse(200, response, "Top pages retrieved"));
});

// 4. Event counts
export const getEventCounts = asyncHandler(async (req, res) => {
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'eventName' }],
        metrics: [{ name: 'eventCount' }],
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    });

    console.log('Most triggered events:');
    response.rows?.forEach(row => {
        console.log(row.dimensionValues[0], row.metricValues[0]);
    });

    return res.status(200).json(new ApiResponse(200, response, "Event counts retrieved"));
});

// 5. Conversions by source
export const getConversionsBySource = asyncHandler(async (req, res) => {
    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'source' }],
        metrics: [{ name: 'conversions' }],
        orderBys: [{ metric: { metricName: 'conversions' }, desc: true }],
    });

    console.log('Conversions by source:');
    response.rows?.forEach(row => {
        console.log(row.dimensionValues[0], row.metricValues[0]);
    });

    return res.status(200).json(new ApiResponse(200, response, "Conversions by source retrieved"));
});
