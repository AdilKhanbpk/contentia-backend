import mongoose from "mongoose";
import slugify from "slugify";
import ApiError from "../../utils/ApiError.js";

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
termsAndConditionsSchema.pre("save", async function (next) {
    if (this.isModified("pageTitle")) {
        this.pageSlug = slugify(this.pageTitle, { lower: true, strict: true });

        const existingDoc = await this.constructor.findOne({ pageSlug: this.pageSlug });
        if (existingDoc) {
            throw new ApiError(400, "Page with this title already exists");
        }
    }
    next();
});


const TermsAndConditionsModel =
    mongoose.models.termsAndConditionsModel ||
    mongoose.model("termsAndConditions", termsAndConditionsSchema);

export default TermsAndConditionsModel;
