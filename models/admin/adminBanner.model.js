import mongoose from "mongoose";
const Schema = mongoose.Schema;

const bannerSchema = new Schema(
  {
    bannerImage: {
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
