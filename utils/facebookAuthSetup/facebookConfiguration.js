import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import dotenv from "dotenv";
import User from "../../models/user.model.js";
import { generateTokens } from "../../controllers/user.controller.js";

dotenv.config();

export const facebookSetup = () => {
    passport.use(
        new FacebookStrategy(
            {
                clientID: process.env.FACEBOOK_CLIENT_ID,
                clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
                callbackURL: process.env.FACEBOOK_CALLBACK_URL,
                profileFields: ["id", "emails", "name"],
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    const fullName = `${profile.name.givenName} ${profile.name.familyName}`;

                    let user = await User.findOne({ email });

                    if (!user) {
                        user = await User.create({
                            email,
                            fullName,
                            authProvider: "facebook",
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
