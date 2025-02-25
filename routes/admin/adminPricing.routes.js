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

// GET Requests
router.get("/", isAuthenticated, getPricePlans);
router.get("/:pricePlanId", isAuthenticated, isAdmin, getPricePlanById);

// POST Requests
router.post("/", isAuthenticated, isAdmin, createPricePlan);

// PATCH Requests
router.patch("/:pricePlanId", isAuthenticated, isAdmin, updatePricePlan);

// DELETE Requests
router.delete("/:pricePlanId", isAuthenticated, isAdmin, deletePricePlan);

export default router;
