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
      ref: "Customers",
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Orders",
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

const AdminClaims = mongoose.model("AdminClaims", adminClaimsSchema);

export default AdminClaims;
