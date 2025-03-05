import Package from "../../models/admin/adminCustomPackage.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import { sendNotification } from "./adminNotification.controller.js";
import { notificationTemplates } from "../../helpers/notificationTemplates.js";
import User from "../../models/user.model.js";

const createCustomPackage = asyncHandler(async (req, res) => {
    const {
        packageType,
        noOfUgc,
        customerId,
        packageTotalPrice,
        packageAdditionalServices,
        packageBriefContent,
        packagePreferences,
    } = req.body;

    isValidId(customerId);

    const customer = await User.findById(customerId);
    if (!customer) {
        throw new ApiError(404, "Customer not found");
    }

    if (
        !packageAdditionalServices ||
        !packageAdditionalServices.platform ||
        !packageAdditionalServices.duration ||
        !packageAdditionalServices.edit ||
        !packageAdditionalServices.aspectRatio
    ) {
        throw new ApiError(400, "Please provide all additional services");
    }

    const createdPackage = await Package.create({
        packageType,
        noOfUgc,
        packageTotalPrice,
        packageAdditionalServices,
        packageBriefContent,
        packagePreferences,
        packageCreator: req.user._id,
        packageCustomer: customer._id,
    });

    if (!createdPackage) {
        throw new ApiError(500, "Failed to create package");
    }

    const notificationData = notificationTemplates.adminCustomPackageCreationToCustomer({
        targetUsers: [customer._id],
        metadata: {
            packageId: createdPackage._id,
            customerName: req.user.fullName,
            customerEmail: req.user.email,
            customerPhoneNumber: req.user.phoneNumber,
        },
    });
    await sendNotification(notificationData);

    return res
        .status(201)
        .json(
            new ApiResponse(201, "Package created successfully", createdPackage)
        );
});

const getAllCustomPackages = asyncHandler(async (req, res) => {
    const packages = await Package.find().populate({
        path: "packageCustomer",
        select: "_id fullName email profilePic",
    }).populate({
        path: "packageCreator",
        select: "_id fullName email profilePic",
    });

    if (!packages || packages.length === 0) {
        throw new ApiError(404, "No packages found");
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                packages,
                "All packages retrieved successfully"
            )
        );
});

const getAllCustomPackagesByCustomer = asyncHandler(async (req, res) => {
    const customerId = req.user._id;

    isValidId(customerId);

    const packages = await Package.find({
        packageCustomer: customerId,
    }).populate({
        path: "packageCustomer",
        select: "_id fullName email",
    }).populate({
        path: "packageCreator",
        select: "_id fullName email",
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                packages,
                "All packages retrieved successfully"
            )
        );
});

const getCustomPackageById = asyncHandler(async (req, res) => {
    const { packageId } = req.params;

    const packageData = await Package.findById(packageId).populate({
        path: "packageCustomer",
        select: "_id fullName email",
    }).populate({
        path: "packageCreator",
        select: "_id fullName email",
    });

    if (!packageData) {
        throw new ApiError(404, "Package not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, packageData, "Package retrieved successfully")
        );
});

const updateCustomPackage = asyncHandler(async (req, res) => {
    const { packageId } = req.params;
    const updateData = req.body;

    const updatedPackage = await Package.findByIdAndUpdate(
        packageId,
        {
            $set: updateData,
        },
        { new: true }
    );

    if (!updatedPackage) {
        throw new ApiError(404, "Package not found or failed to update");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPackage, "Package updated successfully")
        );
});

const deleteCustomPackage = asyncHandler(async (req, res) => {
    const { packageId } = req.params;

    const deletedPackage = await Package.findByIdAndDelete(packageId);

    if (!deletedPackage) {
        throw new ApiError(404, "Package not found or failed to delete");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedPackage, "Package deleted successfully")
        );
});

export {
    createCustomPackage,
    getAllCustomPackages,
    getAllCustomPackagesByCustomer,
    getCustomPackageById,
    updateCustomPackage,
    deleteCustomPackage,
};
