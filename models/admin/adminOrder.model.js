const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    orderStatus: {
      type: String,
      enum: ["Active", "Completed", "Cancelled", "Revision"],
      required: true,
    },
    totalOrder: {
      type: Number,
      required: true,
    },
    contentsDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Refunded", "Cancelled"],
      required: true,
    },
    additionalServices: {
      platform: {
        type: String,
        enum: ["Meta", "TikTok", "Other"],
        required: true,
      },
      duration: {
        type: String,
        enum: ["15s", "30s", "60s"],
        required: true,
      },
      edit: {
        type: Boolean,
        required: true,
        default: false,
      },
      aspectRatio: {
        type: String,
        enum: ["9:16", "16:9"],
        required: true,
      },
      share: {
        type: Boolean,
        required: true,
        default: false,
      },
      coverPicture: {
        type: Boolean,
        required: true,
        default: false,
      },
      creatorType: {
        type: String,
        enum: ["Micro", "Nano"],
        required: true,
      },
      creatorGender: {
        type: String,
        enum: ["Man", "Woman", "Mix"],
        required: true,
      },
      minCreatorAge: {
        type: Number,
        required: true,
      },
      maxCreatorAge: {
        type: Number,
        required: true,
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
      },
      showCreatorAddress: {
        type: Boolean,
        required: function () {
          return this.contentType === "Product";
        },
        default: false,
      },
      productShipping: {
        type: Boolean,
        default: false,
      },
      productName: {
        type: String,
      },
      brandName: {
        type: String,
      },
      brief: {
        type: String,
      },
      scenario: {
        type: String,
      },
      example: {
        type: String,
      },
      fileUpload: {
        type: String,
      },
    },
    orderQuota: {
      type: Number,
      required: true,
    },
    numberOfRequests: {
      type: Number,
      required: true,
      default: 0,
    },
    quotaLeft: {
      type: Number,
      required: true,
      default: function () {
        return this.orderQuota - this.numberOfRequests;
      },
    },
  },
  { timestamps: true }
);

const OrderModel =
  mongoose.models.orderModel || mongoose.model("orderModel", orderSchema);

module.exports = OrderModel;
