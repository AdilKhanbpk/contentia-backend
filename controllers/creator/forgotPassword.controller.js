import crypto from "crypto";
import Creator from "../../models/creator.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import sendEmail from "../../utils/email.js";

// This controller handles the forgot password functionality for creators
// Frontend calls this endpoint with an email address
// POST /api/v1/creators/forgot-password
export const forgotPassword = asyncHandler(async (req, res) => {
    const { email, appType = "web" } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const creator = await Creator.findOne({ email });
    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    // Generate Token
    const token = crypto.randomBytes(32).toString("hex");

    // Save token and expiry
    creator.resetPasswordToken = token;
    creator.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await creator.save({ validateBeforeSave: false });

    // Create reset URLs based on app type
    let resetURL;
    let emailContent;

    if (appType === "mobile") {
        // Mobile app deep link
        resetURL = `Contentia_App://reset-password?token=${token}`;
        
        emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #4D4EC9;">Password Reset Request</h2>
                <p>Hello ${creator.fullName},</p>
                <p>You requested a password reset for your Contentia creator account. Please click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetURL}" style="background-color: #4D4EC9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
                </div>
                <p>This link is valid for 1 hour. If you didn't request a password reset, please ignore this email.</p>
                <p>If the button above doesn't work, open the Contentia app and enter this reset code:</p>
                <p style="text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 2px; color: #4D4EC9; margin: 20px 0; padding: 10px; background-color: #f5f5f5; border-radius: 4px;">${token.substring(0, 8)}</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="color: #888; font-size: 12px;">This is an automated email. Please do not reply.</p>
            </div>
        `;
    } else {
        // Web app URL
        resetURL = `Contentia_App://reset-password?token=${token}`;
        
        emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
                <h2 style="color: #4D4EC9;">Password Reset Request</h2>
                <p>Hello ${creator.fullName},</p>
                <p>You requested a password reset for your Contentia creator account. Please click the button below to reset your password:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetURL}" style="background-color: #4D4EC9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">Reset Password</a>
                </div>
                <p>This link is valid for 1 hour. If you didn't request a password reset, please ignore this email.</p>
                <p>If the button above doesn't work, copy and paste the following URL into your browser:</p>
                <p style="word-break: break-all; color: #666;">${resetURL}</p>
                <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;">
                <p style="color: #888; font-size: 12px;">This is an automated email. Please do not reply.</p>
            </div>
        `;
    }

    try {
        // Send the email with the reset link
        await sendEmail({
            email: creator.email,
            subject: "Contentia - Password Reset Link",
            html: emailContent,
        });

        // For security, don't reveal if the email was sent or not
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    null,
                    "If a creator with that email exists, a password reset link has been sent."
                )
            );
    } catch (error) {
        console.error("Email sending error:", error);

        // In development mode, return the token for testing
        if (process.env.NODE_ENV === 'development') {
            return res
                .status(200)
                .json(
                    new ApiResponse(
                        200,
                        { token, resetURL },
                        "Email sending failed, but in development mode, here's the reset token and URL."
                    )
                );
        }

        // In production, reset the token and return a generic error
        creator.resetPasswordToken = undefined;
        creator.resetPasswordExpires = undefined;
        await creator.save({ validateBeforeSave: false });

        throw new ApiError(500, "Error sending email. Please try again later.");
    }
});
