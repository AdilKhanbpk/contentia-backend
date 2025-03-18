import nodemailer from "nodemailer";

const sendEmail = ({ email, subject, text = null, html = null }) => {
    return new Promise((resolve, reject) => {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mail_configs = {
            from: '"Muhammad Ammar Afridi" <ammardata122@gmail.com>',
            to: Array.isArray(email) ? email.join(",") : email,
            subject: subject,
            ...(text && { text }),
            ...(html && { html }),
        };

        transporter.sendMail(mail_configs, (err, info) => {
            if (err) {
                return reject({ message: err.message });
            }
            return resolve({ message: "Mail is Sent Successfully" });
        });
    });
};

export default sendEmail;
