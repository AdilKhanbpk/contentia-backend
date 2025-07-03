import express from "express";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
    createHowItWorks,
    deleteHowItWorks,
    getHowItWorks,
    getHowItWorksById,
    updateStepInHowItWorks,
} from "../../controllers/admin/adminHowItWorks.controller.js";

const router = express.Router();

// Apply authentication globally

// GET Routes
router.get("/", getHowItWorks);
router.get("/:howItWorksId", isAuthenticated, isAdmin, getHowItWorksById);

// POST Route
router.post("/", isAuthenticated, isAdmin, createHowItWorks);

// PATCH Route
router.patch("/:howItWorksId", isAuthenticated, isAdmin, updateStepInHowItWorks);

// DELETE Route
router.delete("/:howItWorksId", isAuthenticated, isAdmin, deleteHowItWorks);

export default router;
