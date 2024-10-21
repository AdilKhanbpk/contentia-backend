import mongoose from "mongoose";
const Schema = mongoose.Schema;

const bannerSchema = new Schema(
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
  },
  {
    timestamps: true,
  }
);

const BannerModel =
  mongoose.models.bannerModel || mongoose.model("banner", bannerSchema);

export default BannerModel;
