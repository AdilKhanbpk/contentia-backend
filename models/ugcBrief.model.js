import mongoose from "mongoose";

const FormSchema = new mongoose.Schema(
  {
    brand: { type: String, required: false },
    brief: { type: String, maxLength: 1000 },
    productName: { type: String, required: true },
    scenario: String,
    description: String,
    sampleWork: String,
    country: String,
    website: String,
    category: String,
    files: { type: String }, // Field to store the file path or name
  },
  { timestamps: true }
);

export default mongoose.model("UgcBrief", FormSchema);
