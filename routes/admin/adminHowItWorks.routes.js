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
router.use(isAuthenticated);

// GET Routes
router.get("/", getHowItWorks);
router.get("/:howItWorksId", isAdmin, getHowItWorksById);

// POST Route
router.post("/", isAdmin, createHowItWorks);

// PATCH Route
router.patch("/:howItWorksId", isAdmin, updateStepInHowItWorks);

// DELETE Route
router.delete("/:howItWorksId", isAdmin, deleteHowItWorks);

export default router;
