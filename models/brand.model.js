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
            default: function () {
                return `https://ui-avatars.com/api/?name=${this.brandName
                    ?.slice(0, 2)
                    .toUpperCase()}&background=4D4EC9&color=ffffff&size=128`;
            },
        },
    },
    {
        timestamps: true,
    }
);

const BrandModel =
    mongoose.models.brandModel || mongoose.model("brand", brandSchema);

export default BrandModel;
