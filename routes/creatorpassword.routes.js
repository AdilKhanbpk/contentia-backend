import express from "express";
import { creatorforgotPassword } from "../controllers/user/creatorforgotpasseord.controller.js";
import { resetPassword } from "../controllers/user/resetPassword.controller.js";
import { verifyCreatorResetToken } from "../controllers/user/veritycreatorresettoken.controller.js";

const router = express.Router();

// GET Routes
router.get("/verify-reset-token/:token", verifyCreatorResetToken);

// POST Routes
router.post("/forgot-creator-password", creatorforgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;