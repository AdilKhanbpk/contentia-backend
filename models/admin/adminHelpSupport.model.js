import mongoose from "mongoose";
const Schema = mongoose.Schema;

const helpSupportSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        content: {
            type: String,
            required: true,
        },
        icon: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const HelpSupportModel =
    mongoose.models.helpSupportModel ||
    mongoose.model("helpSupport", helpSupportSchema);

export default HelpSupportModel;
