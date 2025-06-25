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
    syncPricePlanWithParasut,
} from "../../controllers/admin/adminPricing.controller.js";

const router = express.Router();

// GET Requests
router.get("/", getPricePlans);
router.get("/:pricePlanId", isAuthenticated, isAdmin, getPricePlanById);

// POST Requests
router.post("/", isAuthenticated, isAdmin, createPricePlan);

// PATCH Requests
router.patch("/:pricePlanId", isAuthenticated, isAdmin, updatePricePlan);

// POST Requests for specific actions
router.post("/:pricePlanId/sync-parasut", isAuthenticated, isAdmin, syncPricePlanWithParasut);

// DELETE Requests
router.delete("/:pricePlanId", isAuthenticated, isAdmin, deletePricePlan);

export default router;
