const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const couponSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    discountType: {
      type: String,
      enum: ["fixed", "percentage"], // e.g., fixed discount or percentage
      required: true,
    },
    discountValue: {
      type: Number,
      required: true,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: null, // null means no limit
    },
    usedCount: {
      type: Number,
      default: 0, // How many times the coupon has been used
    },
  },
  {
    timestamps: true,
  }
);

const CouponModel =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

module.exports = CouponModel;
