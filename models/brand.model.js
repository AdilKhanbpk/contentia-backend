import mongoose from "mongoose";
const Schema = mongoose.Schema;

const brandSchema = new Schema(
  {
    brandName: {
      type: String,
      required: true,
    },
    brandCategory: {
      type: String,
      required: true,
    },
    brandWebsite: {
      type: String,
    },
    brandCountry: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const BrandModel =
  mongoose.models.brandModel || mongoose.model("brand", brandSchema);

export default BrandModel;
