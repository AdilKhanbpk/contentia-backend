import Creator from "../../models/creator.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import sendEmail from "../../utils/email.js";

// This controller handles the reset password functionality for creators
// Frontend calls this endpoint with a token and new password
// POST /api/v1/creators/reset-password/:token
export const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password, appType = "web" } = req.body;

    if (!token || !password) {
        throw new ApiError(400, "Token and password are required");
    }

    // Log the token for debugging in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`Attempting to reset password with token: ${token}`);
    }

    // Find creator with valid reset token
    const creator = await Creator.findOne({
        resetPasswordToken: token,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!creator) {
        throw new ApiError(400, "Token is invalid or has expired");
    }

    // Validate password
    if (password.length < 6) {
        throw new ApiError(400, "Password must be at least 6 characters long");
    }

    // Update password
    creator.password = password;

    // Clear reset token fields
    creator.resetPasswordToken = undefined;
    creator.resetPasswordExpires = undefined;

    try {
        // Save the creator with the new password
        await creator.save({ validateBeforeSave: false });
    } catch (error) {
        console.error("Error saving creator:", error);
        throw new ApiError(500, "Failed to update password. Please try again.");
    }

    // Determine login URL based on app type
    let loginURL = appType === "mobile" 
        ? "Contentia_app://login" 
        : (req.headers.origin || 'http://localhost:3000') + "/creator/login";

    // Send confirmation email
    try {
        await sendEmail({
            email: creator.email,
            subject: "Contentia - Password Reset Successful",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                    <h2 style="color: #4D4EC9;">Password Reset Successful</h2>
                    <p>Hello ${creator.fullName},</p>
                    <p>Your password has been successfully reset. You can now log in with your new password.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${loginURL}" style="background-color: #4D4EC9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Go to Login</a>
                    </div>
                    <p>If you did not request this password reset, please contact our support team immediately.</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                    <p style="color: #888; font-size: 12px;">This is an automated email. Please do not reply.</p>
                </div>
            `,
        });
    } catch (error) {
        console.error("Error sending confirmation email:", error);
        // Continue with the response even if email fails
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                null,
                "Password updated successfully"
            )
        );
});
