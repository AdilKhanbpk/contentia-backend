const nodemailer = require("nodemailer");

exports.sendResetEmail = async (to, resetLink) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_PASS
    }
  });

  await transporter.sendMail({
    from: `"Your App" <${process.env.EMAIL_FROM}>`,
    to,
    subject: "Password Reset Link",
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link valid for 1 hour.</p>`
  });
};
