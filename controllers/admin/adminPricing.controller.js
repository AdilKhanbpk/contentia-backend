const PricePlanModel = require("../../models/admin/adminPricing.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const createPricePlan = asyncHandler(async (req, res, next) => {
  const { videoCount, strikeThroughPrice, finalPrice } = req.body;

  if (!videoCount || !finalPrice) {
    return next(new ApiError(400, "Video count and final price are required."));
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

const getPricePlanById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const pricePlan = await PricePlanModel.findById(id);

  if (!pricePlan) {
    return next(new ApiError(404, `Price plan not found with id: ${id}`));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, pricePlan, "Price plan retrieved successfully"));
});

const updatePricePlan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { videoCount, strikeThroughPrice, finalPrice } = req.body;
  const pricePlan = await PricePlanModel.findById(id);

  if (!pricePlan) {
    return next(new ApiError(404, `Price plan not found with id: ${id}`));
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

const deletePricePlan = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const pricePlan = await PricePlanModel.findById(id);

  if (!pricePlan) {
    return next(new ApiError(404, `Price plan not found with id: ${id}`));
  }

  await pricePlan.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Price plan deleted successfully"));
});

module.exports = {
  createPricePlan,
  getPricePlans,
  getPricePlanById,
  updatePricePlan,
  deletePricePlan,
};
