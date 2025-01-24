import { OAuth2Client } from "google-auth-library";
import ApiResponse from "../../ApiResponse.js";
import User from "../../../models/user.model.js";
import CreatorModel from "../../../models/creator.model.js";
import { generateTokens as generateCreatorTokens } from "../../../controllers/creator.controller.js";
import { generateTokens } from "../../../controllers/user.controller.js";

const client = new OAuth2Client(process.env.GOOGLE_MOBILE_CLIENT_ID);

export const googleAuthMobile = async (req, res, next) => {
    try {
        const { idToken, userType } = req.body;
        console.log("🚀 ~ googleAuthMobile ~ userType:", userType);
        console.log("🚀 ~ googleAuthMobile ~ idToken:", idToken);
        if (!idToken || !userType) {
            return res.status(400).json({
                success: false,
                message: "idToken and userType are required",
            });
        }
        const ticket = await client.verifyIdToken({
            idToken,
        });
        console.log("🚀 ~ googleAuthMobile ~ ticket:", ticket);
        req.userPayload = ticket.getPayload();
        req.userType = userType;
        next();
    } catch (error) {
        console.error("Error in googleAuthMobile:", error);
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};

export const googleAuthCallbackMobile = async (req, res) => {
    const { userPayload, userType } = req;
    console.log("🚀 ~ googleAuthCallbackMobile ~ userType:", userType);
    console.log("🚀 ~ googleAuthCallbackMobile ~ userPayload:", userPayload);
    const { email, name: fullName } = userPayload;
    console.log("🚀 ~ googleAuthCallbackMobile ~ fullName:", fullName);
    console.log("🚀 ~ googleAuthCallbackMobile ~ email:", email);

    try {
        let userModel = userType === "creator" ? CreatorModel : User;
        let tokenGenerator =
            userType === "creator" ? generateCreatorTokens : generateTokens;

        let user = await userModel.findOne({ email });
        if (!user) {
            user = await userModel.create({
                email,
                fullName,
                authProvider: "google",
                userAgreement: true,
            });
        }

        const { accessToken } = await tokenGenerator(user._id);
        res.status(200).json(
            new ApiResponse(
                200,
                { user, accessToken },
                "Authentication successful with Google"
            )
        );
    } catch (error) {
        console.error("Error in googleAuthCallbackMobile:", error);
        res.status(500).json({
            success: false,
            message: "Authentication failed",
        });
    }
};
