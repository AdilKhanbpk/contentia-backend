import express from "express";

import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import {
  createClaim,
  deleteClaim,
  getClaimById,
  getClaims,
  updateClaim,
} from "../../controllers/admin/adminClaims.controller.js";

const router = express.Router();

router.get("", isAuthenticated, getClaims);
router.post("/:customerId/:orderId", isAuthenticated, createClaim);
router.patch("/:claimId", isAuthenticated, updateClaim);
router.delete("/:claimId", isAuthenticated, deleteClaim);
router.get("/:claimId", isAuthenticated, getClaimById);

export default router;
