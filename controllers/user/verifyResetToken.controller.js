import User from "../../models/user.model.js";
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

    // Find user with valid reset token
    const user = await User.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(400, "Token is invalid or has expired");
    }

    // If token is valid, return success
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { valid: true },
                "Token is valid"
            )
        );
});
