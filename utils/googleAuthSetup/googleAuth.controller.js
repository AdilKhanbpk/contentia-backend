// import passport from "passport";

// export const googleAuth = passport.authenticate("google", {
//     scope: ["profile", "email"],
// });

// export const googleAuthCallback = async (req, res) => {
//     try {
//         const user = req.user;
//         const appAccessToken = user.appAccessToken;

//         res.cookie("accessToken", appAccessToken, {
//             httpOnly: true,
//             secure: process.env.NODE_ENV === "production",
//             sameSite: "strict",
//         }).redirect(process.env.SUCCESS_REDIRECT_URL);
//     } catch (error) {
//         console.error("Error in Google authentication callback:", error);
//         res.redirect(process.env.FAILURE_REDIRECT_URL);
//     }
// };
// export const logout = (req, res) => {
//     req.logout((err) => {
//         if (err) {
//             return next(err);
//         }
//         res.redirect("/");
//     });
// };

// FOR THIS PROJECT ONLY

import passport from "passport";

export const googleAuth = (req, res, next) => {
    const userType = req.query.userType; // Get user type from query parameter
    passport.authenticate("google", {
        scope: ["profile", "email"],
        state: JSON.stringify({ userType }), // Pass user type in state parameter
    })(req, res, next);
};

export const googleAuthCallback = async (req, res) => {
    try {
        const user = req.user;
        const appAccessToken = user.appAccessToken;
        const userType = JSON.parse(req.query.state).userType; // Get user type from state parameter

        res.cookie("accessToken", appAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        }).redirect(
            userType === "creator"
                ? process.env.CREATOR_SUCCESS_REDIRECT_URL
                : process.env.CUSTOMER_SUCCESS_REDIRECT_URL
        );
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
