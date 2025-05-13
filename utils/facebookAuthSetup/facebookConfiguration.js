import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import dotenv from "dotenv";
import User from "../../models/user.model.js";
import { generateTokens } from "../../controllers/creator.controller.js";
import CreatorModel from "../../models/creator.model.js";

dotenv.config();

export const facebookSetup = () => {
    // Check if required environment variables are set
    if (!process.env.FACEBOOK_CLIENT_ID || !process.env.FACEBOOK_CLIENT_SECRET || !process.env.FACEBOOK_CALLBACK_URL) {
        console.warn("Facebook authentication is disabled: Missing required environment variables");
        return; // Skip Facebook strategy initialization
    }

    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_CLIENT_ID,
                clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
                callbackURL: process.env.FACEBOOK_CALLBACK_URL,
                profileFields: ["id", "displayName", "photos", "email"],
                scope: ["email", "public_profile"],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const { name, email } = profile._json;

                    let user = await CreatorModel.findOne({ email });

                    if (!user) {
                        user = await CreatorModel.create({
                            email,
                            fullName: name,
                            authProvider: "facebook",
                            phoneNumber: "1234567890",
                            dateOfBirth: "01/01/2000",
                            userAgreement: true,
                        });
                    }

                    const { accessToken: appAccessToken } =
                        await generateTokens(user._id);

                    return done(null, { user, appAccessToken });
                } catch (error) {
                    done(error);
                }
            }
        )
    );

    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
};
