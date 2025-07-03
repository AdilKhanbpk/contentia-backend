import express from "express";
import { appForgotPassword } from "../controllers/user/appForgotPassword.controller.js";
import { resetPassword } from "../controllers/user/resetPassword.controller.js";
import { verifyResetToken } from "../controllers/user/verifyResetToken.controller.js";

const router = express.Router();

// GET Routes
router.get("/verify-reset-token/:token", verifyResetToken);

// POST Routes
router.post("/app-forgot-password", appForgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;
