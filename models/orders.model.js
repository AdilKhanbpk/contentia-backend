import mongoose, { Schema } from "mongoose";
import AdditionalServiceModel from "./admin/adminAdditionalService.model.js";

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
        },
        basePrice: {
            type: Number,
            required: true,
        },
        totalPriceForCustomer: {
            type: Number,
        },
        totalPriceForCreator: {
            type: Number,
        },
        totalPriceForPlatform: {
            type: Number,
        },
        priceForSingleCreator: {
            type: Number,
        },

        // creatorNoteOnOrder: {
        //     type: String,
        // },
        orderStatus: {
            type: String,
            enum: ["pending", "active", "completed", "rejected", "cancelled", "revision"],
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
            areaOfInterest: [String],
            contentType: {
                type: String,
            },
            addressDetails: {
                country: {
                    type: String,
                },
                state: {
                    type: String,
                },
                district: {
                    type: String,
                },
                neighborhood: {
                    type: String,
                },
                fullAddress: {
                    type: String,
                },
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
                creatorNoteOnOrder: {
                    type: String,
                },
            },
        ],
    },
    { timestamps: true }
);


async function fetchServicePrices() {
    const additionalService = await AdditionalServiceModel.findOne({});

    if (!additionalService) {
        // Return default values if no additional service data is found
        return {
            editPrice: 50,
            sharePrice: 30,
            coverPicPrice: 20,
            creatorTypePrice: 100,
            shippingPrice: 25,
            thirtySecondDurationPrice: 75,
            sixtySecondDurationPrice: 150
        };
    }

    return additionalService;
}

ordersProfileSchema.methods.calculateTotalPriceForCustomer = async function () {
    const additionalService = await fetchServicePrices();

    let totalCustomerPrice = this.basePrice;

    if (this.additionalServices.edit)
        totalCustomerPrice += (additionalService.editPrice || 0) * this.noOfUgc;
    if (this.additionalServices.coverPicture)
        totalCustomerPrice += (additionalService.coverPicPrice || 0) * this.noOfUgc;
    if (this.additionalServices.duration === "30s")
        totalCustomerPrice += (additionalService.thirtySecondDurationPrice || 0) * this.noOfUgc;
    if (this.additionalServices.duration === "60s")
        totalCustomerPrice += (additionalService.sixtySecondDurationPrice || 0) * this.noOfUgc;
    if (this.additionalServices.share)
        totalCustomerPrice += (additionalService.sharePrice || 0) * this.noOfUgc;
    if (this.additionalServices.creatorType)
        totalCustomerPrice += (additionalService.creatorTypePrice || 0) * this.noOfUgc;
    if (this.additionalServices.productShipping)
        totalCustomerPrice += (additionalService.shippingPrice || 0) * this.noOfUgc;

    return totalCustomerPrice;
};

ordersProfileSchema.methods.calculateTotalPriceForCreator = async function () {
    const additionalService = await fetchServicePrices();

    let totalCreatorPrice = 0;

    // 50% of base price
    totalCreatorPrice += (this.basePrice || 0) / 2;

    // Additional services
    if (this.additionalServices.edit)
        totalCreatorPrice += ((additionalService.editPrice || 0) * this.noOfUgc) / 2;

    if (this.additionalServices.coverPicture)
        totalCreatorPrice += ((additionalService.coverPicPrice || 0) * this.noOfUgc) / 2;

    if (this.additionalServices.duration === "30s")
        totalCreatorPrice += ((additionalService.thirtySecondDurationPrice || 0) * this.noOfUgc) / 2;

    if (this.additionalServices.duration === "60s")
        totalCreatorPrice += ((additionalService.sixtySecondDurationPrice || 0) * this.noOfUgc) / 2;

    if (this.additionalServices.share)
        totalCreatorPrice += ((additionalService.sharePrice || 0) * this.noOfUgc) / 2;

    // Creator gets full price of creatorType
    if (this.additionalServices.creatorType)
        totalCreatorPrice += (additionalService.creatorTypePrice || 0) * this.noOfUgc;

    // 100% of productShipping will be paid to platform

    return totalCreatorPrice;
};


ordersProfileSchema.methods.calculateTotalPriceForPlatform = async function () {
    const customerTotal = await this.calculateTotalPriceForCustomer();
    const creatorTotal = await this.calculateTotalPriceForCreator();

    return customerTotal - creatorTotal;
};


ordersProfileSchema.pre("save", async function (next) {
    try {
        this.totalPriceForCustomer = await this.calculateTotalPriceForCustomer();
        this.totalPriceForCreator = await this.calculateTotalPriceForCreator();
        this.totalPriceForPlatform = await this.calculateTotalPriceForPlatform();
        if (this.noOfUgc && this.noOfUgc > 0) {
            this.priceForSingleCreator = this.totalPriceForCreator / this.noOfUgc;
        } else {
            this.priceForSingleCreator = 0;
        }
        this.orderQuota = this.noOfUgc;
        this.quotaLeft = this.noOfUgc;
        next();
    } catch (err) {
        next(err);
    }
});

const Order = mongoose.model("Order", ordersProfileSchema);

export default Order;
