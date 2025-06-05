// Previous Nodemailer implementation (commented out)
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





// // New SendGrid implementation
// import sgMail from '@sendgrid/mail';

// // Set SendGrid API key
// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// const sendEmail = ({ email, subject, text = null, html = null }) => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             // Validate required environment variables
//             if (!process.env.SENDGRID_API_KEY) {
//                 throw new Error('SENDGRID_API_KEY is not configured in environment variables');
//             }

//             if (!process.env.FROM_EMAIL) {
//                 throw new Error('FROM_EMAIL is not configured in environment variables');
//             }

//             // Prepare email data
//             const msg = {
//                 from: {
//                     email: process.env.FROM_EMAIL,
//                     name: 'Contentia'
//                 },
//                 subject: subject,
//                 ...(text && { text }),
//                 ...(html && { html }),
//             };

//             // Handle single email or multiple emails
//             if (Array.isArray(email)) {
//                 // For multiple recipients, use personalizations
//                 msg.personalizations = email.map(emailAddress => ({
//                     to: [{ email: emailAddress }],
//                     subject: subject
//                 }));
//             } else {
//                 // For single recipient
//                 msg.to = { email: email };
//             }

//             // Send email using SendGrid
//             console.log('Sending email via SendGrid...');
//             const response = await sgMail.send(msg);

//             console.log('Email sent successfully via SendGrid');
//             console.log('Response status:', response[0].statusCode);

//             return resolve({
//                 message: "Mail is Sent Successfully via SendGrid",
//                 statusCode: response[0].statusCode,
//                 messageId: response[0].headers['x-message-id']
//             });

//         } catch (error) {
//             console.error('SendGrid email error:', error);

//             // Handle SendGrid specific errors
//             if (error.response) {
//                 console.error('SendGrid error response:', error.response.body);
//                 return reject({
//                     message: `SendGrid Error: ${error.message}`,
//                     details: error.response.body
//                 });
//             }

//             return reject({
//                 message: `Email sending failed: ${error.message}`,
//                 error: error
//             });
//         }
//     });
// };

// export default sendEmail;
