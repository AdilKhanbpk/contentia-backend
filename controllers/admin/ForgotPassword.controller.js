const crypto = require("crypto");
const User = require("../models/User");
const { sendResetEmail } = require("../services/emailService");

exports.forgotPasswordController = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not found" });

  // Generate Token
  const token = crypto.randomBytes(32).toString("hex");

  // Save token and expiry
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
  await user.save();

  // Email link
  const resetURL = `$https://contentia-frontend.vercel.app/reset-password/${token}`;
  await sendResetEmail(user.email, resetURL);

  return res.status(200).json({ message: "Reset link sent to email" });
};
