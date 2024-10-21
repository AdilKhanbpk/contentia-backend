import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
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
      enum: ["Active", "Completed", "Cancelled", "Revision"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Refunded", "Cancelled"],
      default: "Pending",
    },
    contentsDelivered: {
      type: Number,
      required: true,
      default: 0,
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
    },
    preferences: {
      creatorGender: {
        type: String,
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
    },
    briefContent: {
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
  mongoose.models.orderModel || mongoose.model("order", orderSchema);

export default OrderModel;
