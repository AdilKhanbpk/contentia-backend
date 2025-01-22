// passportSetup.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../../models/user.model.js";
import { generateTokens } from "../../controllers/user.controller.js";
import CreatorModel from "../../models/creator.model.js";

dotenv.config();

// export const googleSetup = () => {
//     passport.use(
//         new GoogleStrategy(
//             {
//                 clientID: process.env.GOOGLE_CLIENT_ID,
//                 clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//                 callbackURL: process.env.GOOGLE_CALLBACK_URL,
//                 scope: ["profile", "email"],
//             },
//             async (accessToken, refreshToken, profile, done) => {
//                 try {
//                     const email = profile.emails[0].value;
//                     const fullName = profile.displayName;

//                     let user = await User.findOne({ email });

//                     if (!user) {
//                         user = await User.create({
//                             email,
//                             fullName,
//                             authProvider: "google",
//                         });
//                     }

//                     const { accessToken: appAccessToken } =
//                         await generateTokens(user._id);

//                     return done(null, { user, appAccessToken });
//                 } catch (error) {
//                     done(error);
//                 }
//             }
//         )
//     );

//     passport.serializeUser((user, done) => {
//         done(null, user);
//     });

//     passport.deserializeUser((user, done) => {
//         done(null, user);
//     });
// };

// FOR THIS PROJECT ONLY

export const googleSetup = () => {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
                passReqToCallback: true, // Add this line to pass the request to the callback
            },
            async (req, accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    const fullName = profile.displayName;
                    const userType = JSON.parse(req.query.state).userType; // Get user type from state parameter

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
