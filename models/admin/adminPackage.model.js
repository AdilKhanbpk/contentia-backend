import mongoose from "mongoose";
const Schema = mongoose.Schema;

const packageSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Package =
    mongoose.models.package || mongoose.model("Package", packageSchema);

export default Package;
