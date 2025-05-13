// passportSetup.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../../models/user.model.js";
import { generateTokens as generateCreatorTokens } from "../../controllers/creator.controller.js";
import { generateTokens } from "../../controllers/user.controller.js";
import CreatorModel from "../../models/creator.model.js";
import logger from "../logger/logger.js";

dotenv.config();

export const googleSetup = () => {
    // Check if required environment variables are set
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
        console.warn("Google authentication is disabled: Missing required environment variables");
        return; // Skip Google strategy initialization
    }

    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
                passReqToCallback: true,
            },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    const fullName = profile.displayName;
                    const userType = JSON.parse(req.query.state).userType;

                    let user;
                    const userData = {
                        email,
                        fullName,
                        authProvider: "google",
                        userAgreement: true,
                        phoneNumber: "1234567890",
                        dateOfBirth: "01/01/2000",
                    };

                    if (userType === "creator") {
                        user = await CreatorModel.findOne({ email });
                        if (!user) {
                            user = await CreatorModel.create(userData);

                            const { accessToken: appAccessToken } =
                                await generateCreatorTokens(user._id);

                            return done(null, { user, appAccessToken });
                        } else {
                            const { accessToken: appAccessToken } =
                                await generateCreatorTokens(user._id);
                            return done(null, { user, appAccessToken });
                        }
                    } else {
                        user = await User.findOne({ email });
                        if (!user) {
                            user = await User.create(userData);
                        }
                        const { accessToken: appAccessToken } =
                            await generateTokens(user._id);

                        return done(null, { user, appAccessToken });
                    }
                } catch (error) {
                    logger.error(
                        "Error in Google authentication callback:",
                        error
                    );
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
