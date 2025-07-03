import passport from "passport";

export const appleAuth = passport.authenticate("apple");

export const appleAuthCallback = async (req, res) => {
    try {
        const user = req.user;
        const appAccessToken = user.appAccessToken;

        res.cookie("accessToken", appAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        }).redirect(process.env.SUCCESS_REDIRECT_URL);
    } catch (error) {
        console.error("Error in Apple authentication callback:", error);
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
