const nodemailer = require("nodemailer");

const sendEmail = ({ email, subject, text }) => {
  return new Promise((resolve, reject) => {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Logging input parameters for debugging
    console.log("Sending email:", { email, subject, text });

    const mail_configs = {
      from: '"Muhammad Ammar Afridi" <ammardata122@gmail.com>',
      to: email,
      subject: subject,
      text: text,
      // html: "<h1>Hello world</h1>", // Uncomment to send HTML emails
    };

    transporter.sendMail(mail_configs, (err, info) => {
      if (err) {
        console.log("Error sending email:", err.message);
        return reject({ message: err.message });
      }
      console.log("Email sent successfully:", info);
      return resolve({ message: "Mail is Sent Successfully" });
    });
  });
};

module.exports = sendEmail; // Corrected export statement
