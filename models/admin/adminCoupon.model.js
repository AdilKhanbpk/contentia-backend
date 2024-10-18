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
    discountTl: {
      type: String,
      required: true,
    },
    discountPercentage: {
      type: Number,
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
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const CouponModel =
  mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

module.exports = CouponModel;
