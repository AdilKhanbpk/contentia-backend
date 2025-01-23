import passport from "passport";
import { OAuth2Client } from "google-auth-library";
import User from "../models/user.model.js";
import Creator from "../models/creator.model.js";
import { generateTokens } from "./user.controller.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthMobile = (req, res, next) => {
    const userType = req.body.userType;
    passport.authenticate("google", {
        scope: ["profile", "email"],
        state: JSON.stringify({ userType, platform: "mobile" }),
    })(req, res, next);
};

export const googleAuthCallbackMobile = async (req, res) => {
    const { idToken, userType } = req.body;

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload.email;
        const fullName = payload.name;

        let user;
        if (userType === "creator") {
            user = await Creator.findOne({ email });
            if (!user) {
                user = await Creator.create({
                    email,
                    fullName,
                    authProvider: "google",
                });
            }
        } else {
            user = await User.findOne({ email });
            if (!user) {
                user = await User.create({
                    email,
                    fullName,
                    authProvider: "google",
                });
            }
        }

        const { accessToken: appAccessToken } = await generateTokens(user._id);

        res.json({
            success: true,
            accessToken: appAccessToken,
            redirectUrl:
                userType === "creator"
                    ? process.env.CREATOR_SUCCESS_REDIRECT_URL
                    : process.env.GOOGLE_FAILURE_URL,
        });
    } catch (error) {
        console.error("Error in Google authentication:", error);
        res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};
