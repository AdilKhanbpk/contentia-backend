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
router.post("/:customerId/:orderId", isAuthenticated, createClaim);
router.patch("/:claimId", isAdmin, isAuthenticated, updateClaim);
router.delete("/:claimId", isAdmin, isAuthenticated, deleteClaim);
router.get("/:claimId", isAdmin, isAuthenticated, getClaimById);

export default router;
