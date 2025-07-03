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

    // Validate customerId if provided
    if (customerId) {
        isValidId(customerId);
    }

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

    // Create the coupon
    const coupon = await CouponModel.create({
        customer: customerId || null, // If no customerId, it applies to all
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
    const coupons = await CouponModel.find()
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
    if (customerId) isValidId(customerId);

    const coupon = await CouponModel.findById(couponId);
    if (!coupon) {
        throw new ApiError(404, "Coupon not found");
    }

    if (
        (discountTl !== undefined && discountPercentage !== undefined) ||
        (discountTl === undefined && discountPercentage === undefined)
    ) {
        throw new ApiError(
            400,
            "You must provide either a discount in TL or a discount percentage, but not both."
        );
    }

    // Validate expiryDate format
    if (expiryDate && isNaN(Date.parse(expiryDate))) {
        throw new ApiError(400, "Invalid expiry date format");
    }

    // If no customerId is provided, apply the coupon to all customers (set it to null)
    coupon.customer = customerId ? customerId : null;
    coupon.code = code ?? coupon.code;
    coupon.discountTl = discountTl ?? coupon.discountTl;
    coupon.discountPercentage = discountPercentage ?? coupon.discountPercentage;
    coupon.expiryDate = expiryDate ?? coupon.expiryDate;
    coupon.usageLimit = usageLimit ?? coupon.usageLimit;
    coupon.isActive = isActive ?? coupon.isActive;

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

    const deletedCoupon = await CouponModel.findByIdAndDelete(couponId);
    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedCoupon, "Coupon deleted successfully")
        );
});

const validateCoupon = asyncHandler(async (req, res) => {
    const { code } = req.body;

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

    // Increase the usedCount by 1
    coupon.usedCount = (coupon.usedCount || 0) + 1;
    await coupon.save();

    return res
        .status(200)
        .json(new ApiResponse(200, coupon, "Coupon is valid"));
});


export {
    createCoupon,
    getCoupons,
    getCouponById,
    updateCoupon,
    deleteCoupon,
    validateCoupon,
    myCoupons,
};
