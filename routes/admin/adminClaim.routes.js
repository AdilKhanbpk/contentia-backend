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

router.get("", isAuthenticated, isAdmin, getClaims);
router.post("/", isAuthenticated, createClaim);
router.patch("/:claimId", isAuthenticated, isAdmin, updateClaim);
router.delete("/:claimId", isAuthenticated, isAdmin, deleteClaim);
router.get("/:claimId", isAuthenticated, isAdmin, getClaimById);

export default router;
