import PricePlanModel from "../../models/admin/adminPricing.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";

const createPricePlan = asyncHandler(async (req, res) => {
    const { title, description, videoCount, strikeThroughPrice, finalPrice } = req.body;

    if (!title, !description, !videoCount || !finalPrice) {
        throw new ApiError(400, "Video count and final price are required.");
    }

    const newPricePlan = await PricePlanModel.create({
        title,
        description,
        videoCount,
        strikeThroughPrice,
        finalPrice,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                newPricePlan,
                "Price plan created successfully"
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

    const updatedPlan = await PricePlanModel.findByIdAndUpdate(
        pricePlanId,
        { $set: { title, description, videoCount, strikeThroughPrice, finalPrice } },
        { new: true }
    );
    console.log("🚀 ~ updatePricePlan ~ updatedPlan:", updatedPlan)

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlan, "Price plan updated successfully")
        );
});

const deletePricePlan = asyncHandler(async (req, res) => {
    const { pricePlanId } = req.params;

    isValidId(pricePlanId);

    const deletedPricePlan = await PricePlanModel.findByIdAndDelete(
        pricePlanId
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedPricePlan,
                "Price plan deleted successfully"
            )
        );
});

export {
    createPricePlan,
    getPricePlans,
    getPricePlanById,
    updatePricePlan,
    deletePricePlan,
};
