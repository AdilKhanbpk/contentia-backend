import mongoose from "mongoose";
const Schema = mongoose.Schema;

const additionalServiceSchema = new Schema(
    {
        editPrice: {
            type: Number,
        },
        sharePrice: {
            type: Number,
        },
        coverPicPrice: {
            type: Number,
        },
        creatorTypePrice: {
            type: Number,
        },
        shippingPrice: {
            type: Number,
        },
        thirtySecondDurationPrice: {
            type: Number,
        },
        sixtySecondDurationPrice: {
            type: Number,
        },
        // Paraşüt item IDs for each service
        parasut_edit_ID: {
            type: String,
            required: false,
            default: null,
        },
        parasut_share_ID: {
            type: String,
            required: false,
            default: null,
        },
        parasut_coverPic_ID: {
            type: String,
            required: false,
            default: null,
        },
        parasut_creatorType_ID: {
            type: String,
            required: false,
            default: null,
        },
        parasut_shipping_ID: {
            type: String,
            required: false,
            default: null,
        },
        parasut_thirtySecond_ID: {
            type: String,
            required: false,
            default: null,
        },
        parasut_sixtySecond_ID: {
            type: String,
            required: false,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const AdditionalServiceModel =
    mongoose.models.additionalService ||
    mongoose.model("additionalService", additionalServiceSchema);

export default AdditionalServiceModel;
