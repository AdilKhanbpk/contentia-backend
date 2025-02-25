import express from "express";
import {
    createCoupon,
    deleteCoupon,
    getCouponById,
    getCoupons,
    myCoupons,
    updateCoupon,
    validateCoupon,
} from "../../controllers/admin/adminCoupon.controller.js";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";

const router = express.Router();

// GET Routes
router.get("/", isAuthenticated, isAdmin, getCoupons);
router.get("/my-coupons", isAuthenticated, myCoupons);
router.get("/:couponId", isAuthenticated, isAdmin, getCouponById);

// POST Routes
router.post("/", isAuthenticated, isAdmin, createCoupon);
router.post("/validate", isAuthenticated, validateCoupon);

// PATCH Routes
router.patch("/:couponId", isAuthenticated, isAdmin, updateCoupon);

// DELETE Routes
router.delete("/:couponId", isAuthenticated, isAdmin, deleteCoupon);

export default router;
