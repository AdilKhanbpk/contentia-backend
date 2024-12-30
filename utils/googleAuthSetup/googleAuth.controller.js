import passport from "passport";

export const googleAuth = passport.authenticate("google", {
    scope: ["profile", "email"],
});

export const googleAuthCallback = async (req, res) => {
    try {
        const user = req.user;
        const appAccessToken = user.appAccessToken;

        res.cookie("accessToken", appAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        }).redirect(process.env.SUCCESS_REDIRECT_URL);
    } catch (error) {
        console.error("Error in Google authentication callback:", error);
        res.redirect(process.env.FAILURE_REDIRECT_URL);
    }
};
export const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
};
