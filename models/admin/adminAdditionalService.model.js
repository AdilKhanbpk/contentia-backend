import mongoose from "mongoose";
const Schema = mongoose.Schema;

const additionalServiceSchema = new Schema(
  {
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
    image: {
      type: String,
    },
    platform: {
      type: String,
    },
    aspectRatio: {
      type: String,
    },
    editPrice: {
      type: Number,
    },
    sharePrice: {
      type: Number,
    },
    coverPicPrice: {
      type: Number,
    },
    creatorTypePrice: {
      type: Number,
    },
    shippingPrice: {
      type: Number,
    },
    thirtySecondDurationPrice: {
      type: Number,
    },
    sixtySecondDurationPrice: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const AdditionalServiceModel =
  mongoose.models.additionalService ||
  mongoose.model("additionalService", additionalServiceSchema);

export default AdditionalServiceModel;
