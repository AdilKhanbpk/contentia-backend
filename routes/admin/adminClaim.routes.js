import express from "express";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
    createClaim,
    deleteClaim,
    getClaimById,
    getClaims,
    updateClaim,
} from "../../controllers/admin/adminClaims.controller.js";

const router = express.Router();

// GET Routes
router.get("/", isAuthenticated, isAdmin, getClaims);
router.get("/:claimId", isAuthenticated, isAdmin, getClaimById);

// POST Routes
router.post("/", isAuthenticated, createClaim);

// PATCH Routes
router.patch("/:claimId", isAuthenticated, isAdmin, updateClaim);

// DELETE Routes
router.delete("/:claimId", isAuthenticated, isAdmin, deleteClaim);

export default router;
