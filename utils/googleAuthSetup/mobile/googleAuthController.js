import passport from "passport";
import { OAuth2Client } from "google-auth-library";
import ApiResponse from "../../ApiResponse.js";
import User from "../../../models/user.model.js";
import CreatorModel from "../../../models/creator.model.js";
import { generateTokens as generateCreatorTokens } from "../../../controllers/creator.controller.js";
import { generateTokens } from "../../../controllers/user.controller.js";

const client = new OAuth2Client(process.env.GOOGLE_MOBILE_CLIENT_ID);

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
            audience: process.env.GOOGLE_MOBILE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload.email;
        const fullName = payload.name;

        const userData = {
            email,
            fullName,
            authProvider: "google",
            userAgreement: true,
            phoneNumber: "1234567890",
            dateOfBirth: "01/01/2000",
        };

        let user;
        if (userType === "creator") {
            user = await CreatorModel.findOne({ email });
            if (!user) {
                user = await CreatorModel.create(userData);
            }
            const { accessToken: appAccessToken } = await generateCreatorTokens(
                user._id
            );
            res.status(200).json(
                new ApiResponse(
                    200,
                    { user, accessToken: appAccessToken },
                    "Authentication successful with google"
                )
            );
        } else {
            user = await User.findOne({ email });
            if (!user) {
                user = await User.create(userData);
            }
            const { accessToken: appAccessToken } = await generateTokens(
                user._id
            );
            res.status(200).json(
                new ApiResponse(
                    200,
                    { user, accessToken: appAccessToken },
                    "Authentication successful with google"
                )
            );
        }
    } catch (error) {
        console.error("Error in Google authentication:", error);
        res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};
