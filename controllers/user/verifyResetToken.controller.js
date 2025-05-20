import User from "../../models/user.model.js";
import Creator from "../../models/creator.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

// This controller verifies if a reset token is valid before showing the reset password form
// GET /api/v1/users/verify-reset-token/:token
export const verifyResetToken = asyncHandler(async (req, res) => {
    const { token } = req.params;

    if (!token) {
        throw new ApiError(400, "Token is required");
    }

    // Find user with valid reset token - first check User model
    let user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    // If not found in User model, check Creator model
    if (!user) {
        user = await Creator.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        });
    }

    if (!user) {
        throw new ApiError(400, "Token is invalid or has expired");
    }

    // Log the found user type for debugging in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`Verified token for user type: ${user.userType || 'creator'}`);
    }

    // If token is valid, return success with user info
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    valid: true,
                    email: user.email,
                    userType: user.userType || 'creator'
                },
                "Token is valid"
            )
        );
});
