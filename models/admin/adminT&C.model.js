import mongoose from "mongoose";

const termsAndConditionsSchema = new mongoose.Schema(
    {
        pageTitle: {
            type: String,
            required: true,
        },
        pageContent: {
            type: String,
            required: true,
        },
        pageSlug: {
            type: String,
            required: true,
        },
        pageCategory: {
            type: String,
            enum: ["creator", "customer"],
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

const TermsAndConditionsModel =
    mongoose.models.termsAndConditionsModel ||
    mongoose.model("termsAndConditions", termsAndConditionsSchema);

export default TermsAndConditionsModel;
