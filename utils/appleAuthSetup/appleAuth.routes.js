import express from "express";
import {
    appleAuth,
    appleAuthCallback,
    logout,
} from "./appleAuth.controller.js";
import passport from "passport";

const router = express.Router();

router.get("/auth/apple", appleAuth);

router.get(
    "/auth/apple/callback",
    passport.authenticate("apple", {
        session: false,
        successRedirect: process.env.APPLE_SUCCESS_URL,
        failureRedirect: process.env.APPLE_FAILURE_URL,
    }),
    appleAuthCallback
);

router.get("/auth/logout", logout);

export default router;
