import mongoose from "mongoose";
import slugify from "slugify";

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
            unique: true,
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

// Auto-generate slug before saving
termsAndConditionsSchema.pre("save", function (next) {
    if (this.isModified("pageTitle")) {
        this.pageSlug = slugify(this.pageTitle, { lower: true, strict: true });
    }
    next();
});

const TermsAndConditionsModel =
    mongoose.models.termsAndConditionsModel ||
    mongoose.model("termsAndConditions", termsAndConditionsSchema);

export default TermsAndConditionsModel;
