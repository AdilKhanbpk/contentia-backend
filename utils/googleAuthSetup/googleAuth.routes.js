import express from "express";
import {
    googleAuth,
    googleAuthCallback,
    logout,
} from "./googleAuth.controller.js";
import passport from "passport";
import { googleAuthMobile } from "./mobile/googleAuthController.js";

const router = express.Router();

router.get("/auth/google", googleAuth);

router.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        session: false,
    }),
    googleAuthCallback
);

router.get("/auth/logout", logout);

router.post("/auth/google/mobile", googleAuthMobile);

export default router;
