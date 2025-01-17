import express from "express";
import {
    facebookAuth,
    facebookAuthCallback,
    logout,
} from "./facebookAuth.controller.js";
import passport from "passport";

const router = express.Router();

router.get("/auth/facebook", facebookAuth);

router.get(
    "/auth/facebook/callback",
    passport.authenticate("facebook", {
        session: false,
        failureRedirect: process.env.FAILURE_REDIRECT_URL,
    }),
    facebookAuthCallback
);

router.get("/auth/logout", logout);

export default router;
