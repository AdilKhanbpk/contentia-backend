import express from "express";
import {
    googleAuth,
    googleAuthCallback,
    logout,
} from "./googleAuth.controller.js";
import passport from "passport";

const router = express.Router();

router.get("/auth/google", googleAuth);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        session: false,
        successRedirect: process.env.GOOGLE_SUCCESS_URL,
        failureRedirect: process.env.GOOGLE_FAILURE_URL,
    }),
    googleAuthCallback
);

router.get("/auth/logout", logout);

export default router;
