import mongoose from "mongoose";
const Schema = mongoose.Schema;

const aboutSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        contactTitle: {
            type: String,
            required: true,
        },
        contactEmail: {
            type: String,
            required: true,
        },
        contactPhone: {
            type: String,
            required: true,
        },
        contactAddress: {
            type: String,
            required: true,
        },
        buttonUrl: {
            type: String,
            required: true,
        },
        aboutImage: {
            type: String,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const AboutModel =
    mongoose.models.About || mongoose.model("About", aboutSchema);

export default AboutModel;
