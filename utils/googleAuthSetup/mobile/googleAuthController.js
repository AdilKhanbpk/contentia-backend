import { OAuth2Client } from "google-auth-library";
import ApiResponse from "../../ApiResponse.js";
import User from "../../../models/user.model.js";
import CreatorModel from "../../../models/creator.model.js";
import { generateTokens as generateCreatorTokens } from "../../../controllers/creator.controller.js";
import { generateTokens } from "../../../controllers/user.controller.js";

const client = new OAuth2Client(process.env.GOOGLE_MOBILE_CLIENT_ID);

export const googleAuthMobile = async (req, res) => {
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

        const payload = ticket.getPayload();
        const email = payload.email;
        const fullName = payload.name;

        let user;
        if (userType === "creator") {
            user = await CreatorModel.findOne({ email });
            if (!user) {
                user = await CreatorModel.create({
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

        console.log("🚀 ~ googleAuthMobile ~ user:", user);

        const { accessToken: appAccessToken } =
            userType === "creator"
                ? await generateCreatorTokens(user._id)
                : await generateTokens(user._id);

        res.json(
            new ApiResponse(
                200,
                {
                    user,
                    accessToken: appAccessToken,
                },
                "Authentication successful with Google"
            )
        );
    } catch (error) {
        console.error("Error in googleAuthMobile:", error);
        res.status(401).json({
            success: false,
            message: "Invalid or expired token",
        });
    }
};
