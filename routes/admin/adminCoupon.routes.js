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

router.post("/", isAuthenticated, isAdmin, createCoupon);
router.get("/", isAuthenticated, isAdmin, getCoupons);
router.get("/my-coupons", isAuthenticated, myCoupons);
router.get("/:couponId", isAuthenticated, isAdmin, getCouponById);
router.patch("/:couponId", isAuthenticated, isAdmin, updateCoupon);
router.delete("/:couponId", isAuthenticated, isAdmin, deleteCoupon);
router.post("/validate", isAuthenticated, validateCoupon);

export default router;
