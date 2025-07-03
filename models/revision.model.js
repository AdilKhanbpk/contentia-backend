import mongoose from "mongoose";

const revisionSchema = new mongoose.Schema(
    {
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
        revisionDate: {
            type: Date,
            default: Date.now,
        },
        revisionContent: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Revision", revisionSchema);
