// import passport from "passport";
// import { Strategy as AppleStrategy } from "passport-apple";
// import dotenv from "dotenv";
// import User from "../../models/user.model.js";
// import { generateTokens } from "../../controllers/user.controller.js";

// dotenv.config();

// export const appleSetup = () => {
//     passport.use(
//         new AppleStrategy(
//             {
//                 clientID: process.env.APPLE_CLIENT_ID,
//                 teamID: process.env.APPLE_TEAM_ID,
//                 keyID: process.env.APPLE_KEY_ID,
//                 privateKey: process.env.APPLE_PRIVATE_KEY.replace(/\\n/g, "\n"), // Ensure newlines are correctly formatted
//                 callbackURL: process.env.APPLE_CALLBACK_URL,
//             },
//             async (accessToken, refreshToken, idToken, profile, done) => {
//                 try {
//                     const email = profile.email;
//                     const fullName = profile.name
//                         ? `${profile.name.firstName} ${profile.name.lastName}`
//                         : null;

//                     let user = await User.findOne({ email });

//                     if (!user) {
//                         user = await User.create({
//                             email,
//                             fullName,
//                             authProvider: "apple",
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
