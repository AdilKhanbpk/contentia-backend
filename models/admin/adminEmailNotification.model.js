import mongoose from "mongoose";

const emailNotificationSchema = new mongoose.Schema(
    {
        userType: {
            type: String,
            required: true,
        },
        users: {
            type: [mongoose.Types.ObjectId],
            ref: "user",
        },
        emailTitle: {
            type: String,
            required: true,
        },
        emailContent: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const EmailNotification = mongoose.model(
    "EmailNotification",
    emailNotificationSchema
);

export default EmailNotification;
