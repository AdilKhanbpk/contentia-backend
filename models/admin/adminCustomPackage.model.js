// models/packageModel.js
import mongoose, { Schema } from "mongoose";

const packageSchema = new Schema({
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
    packageBriefContent: {
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
});

const PackageModel = mongoose.model("CustomPackage", packageSchema);

export default PackageModel;
