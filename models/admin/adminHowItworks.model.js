import mongoose from "mongoose";
const Schema = mongoose.Schema;

const stepSchema = new Schema(
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
  { _id: false } // Ensures this is a subdocument without its own _id field
);

const howItWorksSchema = new Schema(
  {
    sectionTitle: {
      type: String,
      required: true,
      trim: true,
    },
    sectionDescription: {
      type: String,
      required: true,
      trim: true,
    },
    steps: {
      type: [stepSchema],
      validate: [arrayLimit, "{PATH} exceeds the limit of 4"], // Optional limit on number of steps
    },
  },
  {
    timestamps: true,
  }
);

function arrayLimit(val) {
  return val.length <= 4;
}

const HowItWorkModel =
  mongoose.models.HowItWorkModel ||
  mongoose.model("HowItWork", howItWorksSchema);

export default HowItWorkModel;
