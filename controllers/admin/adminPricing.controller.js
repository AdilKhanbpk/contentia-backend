// controllers/adminPricingController.js
import PricePlanModel from "../../models/admin/adminPricing.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

const createPricePlan = asyncHandler(async (req, res) => {
  const { videoCount, strikeThroughPrice, finalPrice } = req.body;

  if (!videoCount || !finalPrice) {
    throw new ApiError(400, "Video count and final price are required.");
  }

  const newPricePlan = await PricePlanModel.create({
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
  return res
    .status(200)
    .json(
      new ApiResponse(200, pricePlans, "Price plans retrieved successfully")
    );
});

const getPricePlanById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pricePlan = await PricePlanModel.findById(id);

  if (!pricePlan) {
    throw new ApiError(404, `Price plan not found with id: ${id}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, pricePlan, "Price plan retrieved successfully"));
});

const updatePricePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { videoCount, strikeThroughPrice, finalPrice } = req.body;
  const pricePlan = await PricePlanModel.findById(id);

  if (!pricePlan) {
    throw new ApiError(404, `Price plan not found with id: ${id}`);
  }

  pricePlan.videoCount = videoCount || pricePlan.videoCount;
  pricePlan.strikeThroughPrice =
    strikeThroughPrice || pricePlan.strikeThroughPrice;
  pricePlan.finalPrice = finalPrice || pricePlan.finalPrice;

  await pricePlan.save();

  return res
    .status(200)
    .json(new ApiResponse(200, pricePlan, "Price plan updated successfully"));
});

const deletePricePlan = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const pricePlan = await PricePlanModel.findById(id);

  if (!pricePlan) {
    throw new ApiError(404, `Price plan not found with id: ${id}`);
  }

  await pricePlan.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Price plan deleted successfully"));
});

export {
  createPricePlan,
  getPricePlans,
  getPricePlanById,
  updatePricePlan,
  deletePricePlan,
};
