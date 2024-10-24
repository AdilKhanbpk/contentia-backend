import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getCouponById,
  getCoupons,
  updateCoupon,
  validateCoupon,
} from "../../controllers/admin/adminCoupon.controller.js";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";

const router = express.Router();

router.post("/", createCoupon);
router.get("/", getCoupons);
router.get("/:couponId", getCouponById);
router.patch("/:couponId", updateCoupon);
router.delete("/:couponId", deleteCoupon);
router.post("/validate", validateCoupon);

export default router;
