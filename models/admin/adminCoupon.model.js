import mongoose from "mongoose";
const Schema = mongoose.Schema;

const couponSchema = new Schema(
    {
        customer: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        code: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        discountTl: {
            type: String,
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
        usedCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

const CouponModel =
    mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default CouponModel;
