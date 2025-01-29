import mongoose from "mongoose";
const Schema = mongoose.Schema;

const brandSchema = new Schema(
    {
        brandOwner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        brandName: {
            type: String,
            required: true,
        },
        brandCategory: {
            type: String,
            required: true,
        },
        brandWebsite: {
            type: String,
        },
        brandCountry: {
            type: String,
            required: true,
        },
        associatedOrders: {
            type: [Schema.Types.ObjectId],
            ref: "Order",
        },
        brandImage: {
            type: String,
            default: "https://placehold.co/100x100?text=No+Brand+Image",
        },
    },
    {
        timestamps: true,
    }
);

const BrandModel =
    mongoose.models.brandModel || mongoose.model("brand", brandSchema);

export default BrandModel;
