const express = require("express");
const { protect } = require("../../controllers/auth.controller");
const PricingController = require("../../controllers/admin/adminPricing.controller");

const router = express.Router();

router.get("/", protect, PricingController.getPricePlans);
router.get("/:id", protect, PricingController.getPricePlanById);
router.post("/", protect, PricingController.createPricePlan);
router.put("/:id", protect, PricingController.updatePricePlan);
router.delete("/:id", protect, PricingController.deletePricePlan);

module.exports = router;
