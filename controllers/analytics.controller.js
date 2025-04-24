import { getDashboardStats } from "../utils/googleAnalytics.service.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";


export const getAnalyticsDashboardStats = asyncHandler(async (req, res) => {
    const stats = await getDashboardStats();
    if (!stats) {
        throw new ApiError(404, "Analytics data not found");
    }
    return res.status(200).json(new ApiResponse(200, stats, "Analytics data retrieved successfully"));
});
