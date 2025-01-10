import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userType: {
            type: String,
            enum: [
                "all",
                "creator",
                "customer",
                "some-customers",
                "some-creators",
            ],
            required: true,
        },
        users: {
            type: [mongoose.Schema.Types.ObjectId],
            refPath: "userRefPath",
        },
        userRefPath: {
            type: String,
            enum: ["User", "Creator"],
        },
        title: {
            type: String,
            required: true,
        },
        details: {
            type: String,
            required: true,
        },
        eventType: {
            type: String,
            enum: [
                "order",
                "creator",
                "admin",
                "customer",
                "package",
                "general",
            ],
            required: true,
        },
        metadata: {
            type: Object, // Holds additional data like order ID, package ID
            default: {},
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
