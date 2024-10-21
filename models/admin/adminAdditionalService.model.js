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
    creatorType: {
      type: String,
    },
    shippingPrice: {
      type: Number,
    },
    durationTime: {
      type: Number,
    },
    durationPrice: {
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
