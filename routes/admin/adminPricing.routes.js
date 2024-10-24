import express from "express";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import {
  createPricePlan,
  deletePricePlan,
  getPricePlanById,
  getPricePlans,
  updatePricePlan,
} from "../../controllers/admin/adminPricing.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getPricePlans);
router.get("/:pricePlanId", isAuthenticated, getPricePlanById);
router.post("/", isAuthenticated, createPricePlan);
router.patch("/:pricePlanId", isAuthenticated, updatePricePlan);
router.delete("/:pricePlanId", isAuthenticated, deletePricePlan);

export default router;
