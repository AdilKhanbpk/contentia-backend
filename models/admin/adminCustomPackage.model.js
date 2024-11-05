// models/packageModel.js
import mongoose, { Schema } from "mongoose";

const packageSchema = new Schema({
  status: {
    type: String,
    enum: ["active", "completed", "refunded"],
    required: true,
    default: "active",
  },
  packageCreator: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  packageCustomer: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  packageType: {
    type: String,
  },
  noOfUgc: {
    type: Number,
  },
  packageStatus: {
    type: String,
    default: "active",
  },
  packageTotalPrice: {
    type: Number,
    required: true,
  },
  packageAssociatedOrders: {
    type: Number,
  },
  packageContentsDelivered: {
    type: Number,
  },
  packageContentsLeft: {
    type: Number,
  },
  packageAdditionalServices: {
    platform: {
      type: String,
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
    },
    coverPicture: {
      type: Boolean,
    },
    creatorType: {
      type: String,
    },
    shipping: {
      type: Boolean,
    },
  },
  packageBriefContent: {
    brandName: {
      type: String,
    },
    brief: {
      type: String,
    },
    scenario: {
      type: String,
    },
    productServiceName: {
      type: String,
    },
    productServiceDesc: {
      type: String,
    },
    caseStudy: {
      type: String,
    },
    uploadFiles: {
      type: String,
    },
  },
  packagePreferences: {
    creatorGender: {
      type: String,
    },
    minCreatorAge: {
      type: Number,
    },
    maxCreatorAge: {
      type: Number,
    },
    interests: {
      type: [String],
    },
    contentType: {
      type: String,
    },
    locationAddress: {
      country: { type: String },
      city: { type: String },
      district: { type: String },
      street: { type: String },
      fullAddress: { type: String },
    },
  },
});

const PackageModel = mongoose.model("Package", packageSchema);

export default PackageModel;
