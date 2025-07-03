import PricePlanModel from "../../models/admin/adminPricing.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import parasutApiService from "../../utils/parasutApi.service.js";

const createPricePlan = asyncHandler(async (req, res) => {
    const { title, description, videoCount, strikeThroughPrice, finalPrice } = req.body;

    if (!title || !description || !videoCount || !finalPrice) {
        throw new ApiError(400, "Title, description, video count and final price are required.");
    }

    // Create the price plan in database first
    const newPricePlan = await PricePlanModel.create({
        title,
        description,
        videoCount,
        strikeThroughPrice,
        finalPrice,
    });

    // Try to sync with Paraşüt API
    let parasutItemId = null;
    let parasutError = null;

    try {
        parasutItemId = await parasutApiService.syncPricePlan(newPricePlan);

        // Update the price plan with Paraşüt item ID
        if (parasutItemId) {
            await PricePlanModel.findByIdAndUpdate(
                newPricePlan._id,
                { parasut_item_ID: parasutItemId },
                { new: true }
            );
            newPricePlan.parasut_item_ID = parasutItemId;
        }
    } catch (error) {
        parasutError = error.message;
        console.error('Failed to sync with Paraşüt API during creation:', error);
        // Continue execution - don't fail the entire operation
    }

    const responseMessage = parasutError
        ? `Price plan created successfully, but Paraşüt sync failed: ${parasutError}`
        : "Price plan created and synced with Paraşüt successfully";

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                {
                    ...newPricePlan.toObject(),
                    parasutSyncStatus: parasutError ? 'failed' : 'success',
                    parasutError: parasutError || null
                },
                responseMessage
            )
        );
});

const getPricePlans = asyncHandler(async (req, res) => {
    const pricePlans = await PricePlanModel.find();
    res.status(200).json(
        new ApiResponse(200, pricePlans, "Price plans retrieved successfully")
    );
});

const getPricePlanById = asyncHandler(async (req, res) => {
    const { pricePlanId } = req.params;

    isValidId(pricePlanId);

    const pricePlan = await findById(PricePlanModel, pricePlanId);

    return res
        .status(200)
        .json(
            new ApiResponse(200, pricePlan, "Price plan retrieved successfully")
        );
});

const updatePricePlan = asyncHandler(async (req, res) => {
    const { pricePlanId } = req.params;
    const { title, description, videoCount, strikeThroughPrice, finalPrice } = req.body;

    isValidId(pricePlanId);

    const existingPlan = await PricePlanModel.findById(pricePlanId);

    if (!existingPlan) {
        throw new ApiError(404, "Price plan not found.");
    }

    // Update the price plan in database first
    const updatedPlan = await PricePlanModel.findByIdAndUpdate(
        pricePlanId,
        { $set: { title, description, videoCount, strikeThroughPrice, finalPrice } },
        { new: true }
    );

    // Try to sync with Paraşüt API
    let parasutError = null;

    try {
        const parasutItemId = await parasutApiService.syncPricePlan(updatedPlan);

        // Update the price plan with Paraşüt item ID if it's new
        if (parasutItemId && !updatedPlan.parasut_item_ID) {
            await PricePlanModel.findByIdAndUpdate(
                pricePlanId,
                { parasut_item_ID: parasutItemId },
                { new: true }
            );
            updatedPlan.parasut_item_ID = parasutItemId;
        }
    } catch (error) {
        parasutError = error.message;
        console.error('Failed to sync with Paraşüt API during update:', error);
        // Continue execution - don't fail the entire operation
    }

    const responseMessage = parasutError
        ? `Price plan updated successfully, but Paraşüt sync failed: ${parasutError}`
        : "Price plan updated and synced with Paraşüt successfully";

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    ...updatedPlan.toObject(),
                    parasutSyncStatus: parasutError ? 'failed' : 'success',
                    parasutError: parasutError || null
                },
                responseMessage
            )
        );
});

const deletePricePlan = asyncHandler(async (req, res) => {
    const { pricePlanId } = req.params;

    isValidId(pricePlanId);

    // Get the price plan first to check for Persuit item ID
    const existingPlan = await PricePlanModel.findById(pricePlanId);

    if (!existingPlan) {
        throw new ApiError(404, "Price plan not found.");
    }

    // Try to delete from Paraşüt API if it has a Paraşüt item ID
    let parasutError = null;

    if (existingPlan.parasut_item_ID) {
        try {
            await parasutApiService.deleteItem(existingPlan.parasut_item_ID);
        } catch (error) {
            parasutError = error.message;
            console.error('Failed to delete from Paraşüt API:', error);
            // Continue execution - don't fail the entire operation
        }
    }

    // Delete from database
    const deletedPricePlan = await PricePlanModel.findByIdAndDelete(pricePlanId);

    const responseMessage = parasutError
        ? `Price plan deleted successfully, but Paraşüt deletion failed: ${parasutError}`
        : "Price plan deleted successfully";

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    ...deletedPricePlan.toObject(),
                    parasutSyncStatus: parasutError ? 'failed' : 'success',
                    parasutError: parasutError || null
                },
                responseMessage
            )
        );
});

/**
 * Manually sync a price plan with Paraşüt API
 * Useful for syncing existing price plans that don't have Paraşüt item IDs
 */
const syncPricePlanWithParasut = asyncHandler(async (req, res) => {
    const { pricePlanId } = req.params;

    isValidId(pricePlanId);

    const pricePlan = await PricePlanModel.findById(pricePlanId);

    if (!pricePlan) {
        throw new ApiError(404, "Price plan not found.");
    }

    try {
        const parasutItemId = await parasutApiService.syncPricePlan(pricePlan);

        // Update the price plan with Paraşüt item ID if it's new
        if (parasutItemId && !pricePlan.parasut_item_ID) {
            await PricePlanModel.findByIdAndUpdate(
                pricePlanId,
                { parasut_item_ID: parasutItemId },
                { new: true }
            );
            pricePlan.parasut_item_ID = parasutItemId;
        }

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {
                        ...pricePlan.toObject(),
                        parasutSyncStatus: 'success'
                    },
                    "Price plan synced with Paraşüt successfully"
                )
            );
    } catch (error) {
        console.error('Failed to sync with Paraşüt API:', error);
        throw new ApiError(500, `Failed to sync with Paraşüt API: ${error.message}`);
    }
});

export {
    createPricePlan,
    getPricePlans,
    getPricePlanById,
    updatePricePlan,
    deletePricePlan,
    syncPricePlanWithParasut,
};
