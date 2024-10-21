import mongoose from "mongoose";
const Schema = mongoose.Schema;

const howItWorksSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const HowItWorkModel =
  mongoose.models.howItWorkModel ||
  mongoose.model("howItWork", howItWorksSchema);

export default HowItWorkModel;
