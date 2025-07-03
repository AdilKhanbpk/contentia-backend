import express from "express";
import { forgotPassword } from "../controllers/user/forgotPassword.controller.js";
import { resetPassword } from "../controllers/user/resetPassword.controller.js";
import { verifyResetToken } from "../controllers/user/verifyResetToken.controller.js";

const router = express.Router();

// GET Routes
router.get("/verify-reset-token/:token", verifyResetToken);

// POST Routes
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
