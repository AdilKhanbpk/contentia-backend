import mongoose from "mongoose";

const adminClaimsSchema = new mongoose.Schema(
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
        creator: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Creator",
        },
        order: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Order",
        },
        claimDate: {
            type: Date,
            default: Date.now,
        },
        claimContent: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const AdminClaims = mongoose.model("Claims", adminClaimsSchema);

export default AdminClaims;
