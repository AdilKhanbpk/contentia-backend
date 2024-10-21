// models/packageModel.js
import mongoose from "mongoose";

const packageSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["Active", "Completed", "Refunded"],
    required: true,
  },
  packageType: {
    type: String,
    required: true,
  },
  packageContentOrders: {
    type: Number,
    required: true,
  },
  packageContentsDelivered: {
    type: Number,
    required: true,
  },
  packageContentsLeft: {
    type: Number,
    required: true,
  },
  packageDetails: {
    platform: {
      type: String,
      enum: ["Meta", "TikTok", "Other"],
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    edit: {
      type: Boolean,
      required: true,
    },
    aspectRatio: {
      type: String,
      required: true,
    },
    share: {
      type: Boolean,
      required: true,
    },
    coverPicture: {
      type: Boolean,
      required: true,
    },
    creatorType: {
      type: String,
      required: true,
    },
    creatorGender: {
      type: String,
    },
    minimumCreatorAge: {
      type: Number,
    },
    maximumCreatorAge: {
      type: Number,
    },
    interests: {
      type: [String],
    },
    contentType: {
      type: String,
      enum: ["Product", "Service", "Location"],
      required: true,
    },
    locationAddress: {
      type: String,
      required: true,
    },
    showCreatorAddress: {
      type: Boolean,
      required: function () {
        return this.contentType === "Product";
      },
    },
    productShipping: {
      type: Boolean,
      required: function () {
        return this.contentType === "Product";
      },
    },
    productName: {
      type: String,
      required: function () {
        return this.contentType === "Product";
      },
    },
    brandName: {
      type: String,
      required: function () {
        return this.contentType === "Product";
      },
    },
    brief: {
      type: String,
      required: true,
    },
    scenario: {
      type: String,
      required: true,
    },
    example: {
      type: String,
      required: true,
    },
    fileUpload: {
      type: String,
      required: true,
    },
  },
});

const PackageModel = mongoose.model("Package", packageSchema);

export default PackageModel;
