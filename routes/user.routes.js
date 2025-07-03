import express from "express";
import {
    changePassword,
    changeProfilePic,
    getProfile,
    login,
    logout,
    signup,
    updateUser,
    verifyOtp,
    resendOtp,  // Add resendOtp to imports
} from "../controllers/user.controller.js";
import { uploadOnMulter } from "../middlewares/multer.middleware.js";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";

const router = express.Router();

// GET Routes
router.get("/me", isAuthenticated, getProfile);
router.get("/logout", isAuthenticated, logout);

// POST Routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);  // Add the new resend OTP endpoint

// PATCH Routes
router.patch("/update-me", isAuthenticated, updateUser);
router.patch("/change-password", isAuthenticated, changePassword);
router.patch(
    "/change-profilePic",
    isAuthenticated,
    uploadOnMulter.single("profilePic"),
    changeProfilePic
);

export default router;
