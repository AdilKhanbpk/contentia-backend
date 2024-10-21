import mongoose from "mongoose";

const ordersProfileSchema = new mongoose.Schema(
  {
    orderOwner: {
      type: mongoose.Types.ObjectId,
      ref: "customer",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    orderStatus: {
      type: String,
      enum: ["active", "completed", "cancelled", "revision"],
      required: true,
      default: "active",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "refunded", "cancelled"],
      default: "pending",
    },
    contentsDelivered: {
      type: Number,
    },
    additionalServices: {
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
        default: false,
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
      locationAddress: {
        type: String,
      },
      showCreatorAddress: {
        type: Boolean,
      },
      productShipping: {
        type: Boolean,
      },
    },
    preferences: {
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
    briefContent: {
      brandName: {
        type: String,
        required: true,
      },
      brief: {
        type: String,
        required: true,
      },
      productServiceName: {
        type: String,
        required: true,
      },
      productServiceDesc: {
        type: String,
        required: true,
      },
      scenario: {
        type: String,
      },
      caseStudy: {
        type: String,
      },
      uploadFiles: {
        type: String,
      },
      uploadFileDate: {
        type: String,
      },
    },
    orderQuota: {
      type: Number,
    },
    numberOfRequests: {
      type: Number,
    },
    quotaLeft: {
      type: Number,
    },
  },
  { timestamps: true }
);

const OrdersProfile = mongoose.model("Order", ordersProfileSchema);

export default OrdersProfile;
