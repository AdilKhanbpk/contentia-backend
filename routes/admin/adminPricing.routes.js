import express from "express";
import {
  isAuthenticated,
  isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
  createPricePlan,
  deletePricePlan,
  getPricePlanById,
  getPricePlans,
  updatePricePlan,
} from "../../controllers/admin/adminPricing.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getPricePlans);
router.get("/:pricePlanId", isAuthenticated, isAdmin, getPricePlanById);
router.post("/", isAuthenticated, isAdmin, createPricePlan);
router.patch("/:pricePlanId", isAuthenticated, isAdmin, updatePricePlan);
router.delete("/:pricePlanId", isAuthenticated, isAdmin, deletePricePlan);

export default router;
