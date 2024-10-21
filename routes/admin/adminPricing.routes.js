import express from "express";
import { protect } from "../../controllers/auth.controller.js";
import {
  createPricePlan,
  deletePricePlan,
  getPricePlanById,
  getPricePlans,
  updatePricePlan,
} from "../../controllers/admin/adminPricing.controller.js";

const router = express.Router();

router.get("/", protect, getPricePlans);
router.get("/:id", protect, getPricePlanById);
router.post("/", protect, createPricePlan);
router.put("/:id", protect, updatePricePlan);
router.delete("/:id", protect, deletePricePlan);

export default router;
