import express from "express";
import {
  createCoupon,
  deleteCoupon,
  getCouponById,
  getCoupons,
  updateCoupon,
  validateCoupon,
} from "../../controllers/admin/adminCoupon.controller.js";

const router = express.Router();

router.post("/create", createCoupon);
router.get("/", getCoupons);
router.get("/:id", getCouponById);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);
router.post("/validate", validateCoupon);

export default router;
