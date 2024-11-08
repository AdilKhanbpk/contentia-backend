// passportSetup.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import dotenv from "dotenv";
import User from "../../models/user.model.js";
import { generateTokens } from "../../controllers/user.controller.js";

dotenv.config();

export const passportSetup = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const email = profile.emails[0].value;
          const fullName = profile.displayName;

          let user = await User.findOne({ email });

          if (!user) {
            user = await User.create({
              email,
              fullName,
              authProvider: "google",
            });
          }

          // Generate app-specific JWT for internal usage
          const { accessToken: appAccessToken } = await generateTokens(
            user._id
          );

          console.log(appAccessToken);
          console.log(user);

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
