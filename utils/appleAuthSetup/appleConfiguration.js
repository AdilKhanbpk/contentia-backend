import passport from "passport";
import { Strategy as AppleStrategy } from "passport-apple";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from "../../models/user.model.js";
import { generateTokens } from "../../controllers/user.controller.js";
import CreatorModel from "../../models/creator.model.js";

dotenv.config();

export const appleSetup = () => {
    passport.use(
        new AppleStrategy(
            {
                clientID: process.env.APPLE_CLIENT_ID,
                teamID: process.env.APPLE_TEAM_ID,
                callbackURL: process.env.APPLE_CALLBACK_URL,
                keyID: process.env.APPLE_KEY_ID,
                privateKey: process.env.APPLE_PRIVATE_KEY,
            },
            async (accessToken, refreshToken, idToken, profile, done) => {
                try {

                    const decodedToken = jwt.decode(idToken, {
                        complete: true,
                    });

                    const { email, name, sub } = decodedToken.payload;

                    let user = await CreatorModel.findOne({ email });

                    if (!user) {
                        user = await CreatorModel.create({
                            email,
                            appleId: sub,
                            fullName: name,
                            authProvider: "apple",
                            phoneNumber: "1234567890",
                            dateOfBirth: "01/01/2000",
                            userAgreement: true,
                        });

                        const { accessToken: appAccessToken } =
                            await generateTokens(user._id);

                        return done(null, { user, appAccessToken });
                    }
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
