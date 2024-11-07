import passport from "passport";

export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const googleAuthCallback = passport.authenticate("google", {
  session: false,
  successRedirect: "http://localhost:5173/",
  failureRedirect: "http://localhost:3000/login",
});

export const logout = (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
};
