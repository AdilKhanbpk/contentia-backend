import mongoose from "mongoose";
const Schema = mongoose.Schema;

const pricePlanSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        videoCount: {
            type: Number,
            required: true,
        },
        strikeThroughPrice: {
            type: Number,
            required: false,
        },
        finalPrice: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const PricePlanModel =
    mongoose.models.PricePlan || mongoose.model("PricePlan", pricePlanSchema);

export default PricePlanModel;
