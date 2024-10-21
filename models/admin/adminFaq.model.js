import mongoose from "mongoose";
const Schema = mongoose.Schema;

const faqSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const FaqModel = mongoose.models.faqModel || mongoose.model("faq", faqSchema);

export default FaqModel;
