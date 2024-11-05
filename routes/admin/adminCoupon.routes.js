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
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, createCoupon);
router.get("/", isAuthenticated, getCoupons);
router.get("/my-coupons", isAuthenticated, myCoupons);
router.get("/:couponId", isAuthenticated, getCouponById);
router.patch("/:couponId", isAuthenticated, updateCoupon);
router.delete("/:couponId", isAuthenticated, deleteCoupon);
router.post("/validate", isAuthenticated, validateCoupon);

export default router;
