// controllers/adminPricingController.js
import PricePlanModel from "../../models/admin/adminPricing.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import {
  createADocument,
  deleteById,
  findAll,
  findById,
  findByQuery,
  updateById,
} from "../../utils/dbHelpers.js";

const createPricePlan = asyncHandler(async (req, res) => {
  const { videoCount, strikeThroughPrice, finalPrice } = req.body;

  if (!videoCount || !finalPrice) {
    throw new ApiError(400, "Video count and final price are required.");
  }

  const newPricePlan = await createADocument(PricePlanModel, {
    videoCount,
    strikeThroughPrice,
    finalPrice,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newPricePlan, "Price plan created successfully")
    );
});

const getPricePlans = asyncHandler(async (req, res) => {
  const pricePlans = await PricePlanModel.find();
  res
    .status(200)
    .json(
      new ApiResponse(200, pricePlans, "Price plans retrieved successfully")
    );
});

const getPricePlanById = asyncHandler(async (req, res) => {
  const { pricePlanId } = req.params;

  isValidId(pricePlanId);

  const pricePlan = await findById(PricePlanModel, pricePlanId);

  return res
    .status(200)
    .json(new ApiResponse(200, pricePlan, "Price plan retrieved successfully"));
});

const updatePricePlan = asyncHandler(async (req, res) => {
  const { pricePlanId } = req.params;
  const { videoCount, strikeThroughPrice, finalPrice } = req.body;

  isValidId(pricePlanId);

  const existingPlan = await findById(PricePlanModel, pricePlanId);

  if (!existingPlan) {
    throw new ApiError(404, "Price plan not found.");
  }

  const updateData = {};

  if (videoCount !== undefined) {
    updateData.videoCount = videoCount;
  }
  if (strikeThroughPrice !== undefined) {
    updateData.strikeThroughPrice = strikeThroughPrice;
  }
  if (finalPrice !== undefined) {
    updateData.finalPrice = finalPrice;
  }

  const updatedPlan = await updateById(PricePlanModel, pricePlanId, updateData);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlan, "Price plan updated successfully"));
});

const deletePricePlan = asyncHandler(async (req, res) => {
  const { pricePlanId } = req.params;

  isValidId(pricePlanId);

  const deletedPricePlan = await deleteById(PricePlanModel, pricePlanId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, deletedPricePlan, "Price plan deleted successfully")
    );
});

export {
  createPricePlan,
  getPricePlans,
  getPricePlanById,
  updatePricePlan,
  deletePricePlan,
};
