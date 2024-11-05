import CouponModel from "../../models/admin/adminCoupon.model.js";
import OrderModel from "../../models/orders.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";

const createCoupon = asyncHandler(async (req, res) => {
  const {
    customerId,
    code,
    discountTl,
    discountPercentage,
    expiryDate,
    usageLimit,
  } = req.body;

  isValidId(customerId);

  if (!code || !expiryDate) {
    throw new ApiError(400, "Coupon code and expiry date are required.");
  }

  if (
    (discountTl && discountPercentage) ||
    (!discountTl && !discountPercentage)
  ) {
    throw new ApiError(
      400,
      "You must provide either a discount in TL or a discount percentage, but not both."
    );
  }

  const existingCoupon = await CouponModel.findOne({ code });
  if (existingCoupon) {
    throw new ApiError(400, "Coupon code already exists.");
  }

  const coupon = await CouponModel.create({
    customer: customerId,
    code,
    discountTl,
    discountPercentage,
    expiryDate,
    usageLimit,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

const myCoupons = asyncHandler(async (req, res) => {
  isValidId(req.user._id);

  const coupons = await CouponModel.find({ customer: req.user?._id });

  return res
    .status(200)
    .json(new ApiResponse(200, coupons, "Coupons retrieved successfully"));
});

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await CouponModel.find().populate("customer");
  return res
    .status(200)
    .json(new ApiResponse(200, coupons, "Coupons retrieved successfully"));
});

const getCouponById = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  const coupon = await CouponModel.findById(couponId).populate("customer");

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon retrieved successfully"));
});

const updateCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  const {
    customerId,
    code,
    discountTl,
    discountPercentage,
    expiryDate,
    usageLimit,
    isActive,
  } = req.body;

  isValidId(couponId);
  customerId && isValidId(customerId);
  const coupon = await CouponModel.findById(couponId);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  if (
    (discountTl && discountPercentage) ||
    (!discountTl && !discountPercentage)
  ) {
    throw new ApiError(
      400,
      "You must provide either a discount in TL or a discount percentage, but not both."
    );
  }

  coupon.customer = customerId || coupon.customer;
  coupon.code = code || coupon.code;
  coupon.discountTl = discountTl !== undefined ? discountTl : coupon.discountTl;
  coupon.discountPercentage =
    discountPercentage !== undefined
      ? discountPercentage
      : coupon.discountPercentage;
  coupon.expiryDate = expiryDate || coupon.expiryDate;
  coupon.usageLimit = usageLimit !== undefined ? usageLimit : coupon.usageLimit;
  coupon.isActive = isActive !== undefined ? isActive : coupon.isActive;

  await coupon.save();

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const { couponId } = req.params;
  const coupon = await CouponModel.findById(couponId);

  if (!coupon) {
    throw new ApiError(404, "Coupon not found");
  }

  await coupon.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Coupon deleted successfully"));
});

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderId } = req.body;

  isValidId(orderId);

  if (!code) {
    throw new ApiError(400, "Coupon code is required");
  }

  const coupon = await CouponModel.findOne({ code });

  if (!coupon) {
    throw new ApiError(404, "Invalid coupon code");
  }

  if (!coupon.isActive || coupon.expiryDate < new Date()) {
    throw new ApiError(400, "Coupon is expired or inactive");
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, "Coupon usage limit exceeded");
  }

  const order = await OrderModel.findById(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.coupon && order.coupon.toString() === coupon._id.toString()) {
    throw new ApiError(
      400,
      "This coupon has already been applied to the order"
    );
  }

  let discountAmount = 0;

  if (coupon.discountTl) {
    if (coupon.discountTl > order.totalPrice) {
      throw new ApiError(400, "Coupon discount exceeds order total");
    }
    discountAmount = coupon.discountTl;
  } else if (coupon.discountPercentage) {
    if (coupon.discountPercentage < 0 || coupon.discountPercentage > 100) {
      throw new ApiError(400, "Invalid discount percentage");
    }
    discountAmount = (order.totalPrice * coupon.discountPercentage) / 100;
  }

  order.coupon = coupon._id;
  order.totalPrice =
    Math.round((order.totalPrice - discountAmount) * 100) / 100;

  await Promise.all([
    order.save(),
    CouponModel.findOneAndUpdate(
      { _id: coupon._id },
      { $inc: { usedCount: 1 } },
      { new: true }
    ),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon applied successfully"));
});

export default validateCoupon;

export {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  myCoupons,
};
