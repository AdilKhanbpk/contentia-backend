const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const customPackageSchema = new Schema(
  {
    customer: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "refunded"],
      default: "active",
    },
    packageType: {
      type: String,
      enum: ["custom", "standard"],
    },
    packageContentDelivered: {
      type: String,
    },
    packageContentLeft: {
      type: String,
    },
    creatorType: {
      type: String,
    },
    creatorGender: {
      type: String,
    },
    creatorMinAge: {
      type: Number,
    },
    creatorMaxAge: {
      type: Number,
    },
    noOfUgc: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    platform: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    isEditRequired: {
      type: Boolean,
      required: false,
    },
    aspectRatio: {
      type: String,
      required: false,
    },
    share: {
      type: String,
      required: false,
    },
    coverImage: {
      type: String,
      required: false,
    },
    creatorType: {
      type: String,
      required: false,
    },
    shipping: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

const CustomPackageModel =
  mongoose.models.customPackageModel ||
  mongoose.model("customPackageModel", customPackageSchema);

module.exports = CustomPackageModel;
