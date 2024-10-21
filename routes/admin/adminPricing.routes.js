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
router.get("/:id", isAuthenticated, getPricePlanById);
router.post("/", isAuthenticated, createPricePlan);
router.put("/:id", isAuthenticated, updatePricePlan);
router.delete("/:id", isAuthenticated, deletePricePlan);

export default router;
