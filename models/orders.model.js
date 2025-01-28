import mongoose, { Schema } from "mongoose";

const ordersProfileSchema = new Schema(
    {
        coupon: {
            type: Schema.Types.ObjectId,
            ref: "Coupon",
        },
        orderOwner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        associatedBrands: {
            type: Schema.Types.ObjectId,
            ref: "brand",
        },
        assignedCreators: [
            {
                type: Schema.Types.ObjectId,
                ref: "Creator",
            },
        ],
        appliedCreators: [
            {
                type: Schema.Types.ObjectId,
                ref: "Creator",
            },
        ],
        rejectedCreators: [
            {
                type: Schema.Types.ObjectId,
                ref: "Creator",
            },
        ],

        noOfUgc: {
            type: Number,
        },

        totalPrice: {
            type: Number,
            required: true,
        },
        orderStatus: {
            type: String,
            enum: ["pending", "active", "completed", "cancelled", "revision"],
            required: true,
            default: "pending",
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
            contentType: [
                {
                    type: String,
                },
            ],
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
            },
            brief: {
                type: String,
            },
            productServiceName: {
                type: String,
            },
            productServiceDesc: {
                type: String,
            },
            scenario: {
                type: String,
            },
            caseStudy: {
                type: String,
            },
            uploadFiles: [
                {
                    type: String,
                },
            ],
            uploadFileDate: {
                type: String,
            },
        },

        numberOfRequests: {
            type: Number,
        },
        orderQuota: {
            type: Number,
        },
        quotaLeft: {
            type: Number,
        },
        uploadFiles: [
            {
                uploadedBy: {
                    type: mongoose.Types.ObjectId,
                    ref: "creator",
                },
                fileUrls: {
                    type: [String],
                },
                uploadedDate: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", ordersProfileSchema);

export default Order;
