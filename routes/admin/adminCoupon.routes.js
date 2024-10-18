const express = require("express");
const router = express.Router();
const CouponController = require("../../controllers/admin/adminCoupon.controller");

router.post("/create", CouponController.createCoupon);
router.get("/", CouponController.getCoupons);
router.get("/:id", CouponController.getCouponById);
router.put("/:id", CouponController.updateCoupon);
router.delete("/:id", CouponController.deleteCoupon);
router.post("/validate", CouponController.validateCoupon);

module.exports = router;
