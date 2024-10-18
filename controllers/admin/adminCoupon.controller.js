const CouponModel = require("../../models/admin/adminCoupon.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const createCoupon = asyncHandler(async (req, res, next) => {
  const { code, discountType, discountValue, expiryDate, usageLimit } =
    req.body;

  if (!code || !discountType || !discountValue || !expiryDate) {
    return next(new ApiError(400, "All fields are required."));
  }

  const existingCoupon = await CouponModel.findOne({ code });
  if (existingCoupon) {
    return next(new ApiError(400, "Coupon code already exists."));
  }

  const coupon = await CouponModel.create({
    code,
    discountType,
    discountValue,
    expiryDate,
    usageLimit,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await CouponModel.find();
  return res
    .status(200)
    .json(new ApiResponse(200, coupons, "Coupons retrieved successfully"));
});

const getCouponById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await CouponModel.findById(id);

  if (!coupon) {
    return next(new ApiError(404, "Coupon not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon retrieved successfully"));
});

const updateCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    code,
    discountType,
    discountValue,
    expiryDate,
    usageLimit,
    isActive,
  } = req.body;
  const coupon = await CouponModel.findById(id);

  if (!coupon) {
    return next(new ApiError(404, "Coupon not found"));
  }

  coupon.code = code || coupon.code;
  coupon.discountType = discountType || coupon.discountType;
  coupon.discountValue = discountValue || coupon.discountValue;
  coupon.expiryDate = expiryDate || coupon.expiryDate;
  coupon.usageLimit = usageLimit !== undefined ? usageLimit : coupon.usageLimit;
  coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;

  await coupon.save();

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

const deleteCoupon = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const coupon = await CouponModel.findById(id);

  if (!coupon) {
    return next(new ApiError(404, "Coupon not found"));
  }

  await coupon.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Coupon deleted successfully"));
});

const validateCoupon = asyncHandler(async (req, res, next) => {
  const { code } = req.body;

  const coupon = await CouponModel.findOne({ code });

  if (!coupon) {
    return next(new ApiError(404, "Invalid coupon code"));
  }

  if (!coupon.isActive || coupon.expiryDate < new Date()) {
    return next(new ApiError(400, "Coupon is expired or inactive"));
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    return next(new ApiError(400, "Coupon usage limit exceeded"));
  }

  // Apply the coupon
  coupon.usedCount += 1;
  await coupon.save();

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon applied successfully"));
});

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
};
