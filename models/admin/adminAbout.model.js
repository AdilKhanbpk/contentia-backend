import mongoose from "mongoose";
const Schema = mongoose.Schema;

const aboutSchema = new Schema(
  {
    content: {
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
