import Package from "../../models/admin/adminCustomPackage.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
    createADocument,
    findByQuery,
    updateById,
    deleteById,
    findById,
} from "../../utils/dbHelpers.js";
import { isValidId } from "../../utils/commonHelpers.js";
import { sendNotification } from "./adminNotification.controller.js";

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

    if (
        !packageAdditionalServices ||
        !packageAdditionalServices.platform ||
        !packageAdditionalServices.duration ||
        !packageAdditionalServices.edit ||
        !packageAdditionalServices.aspectRatio
    ) {
        throw new ApiError(400, "Please provide all additional services");
    }

    const createdPackage = await createADocument(Package, {
        packageCreator: req.user._id,
        packageCustomer: customerId,
        noOfUgc,
        packageType,
        packageTotalPrice,
        packageAdditionalServices,
        packageBriefContent,
        packagePreferences,
    });

    if (!createdPackage) {
        throw new ApiError(500, "Failed to create package");
    }

    const notification = {
        userType: "customer",
        eventType: "package",
        title: "New Package",
        details: `A new package has been created for customer ${customerId} with ID ${createdPackage._id}. The package includes ${noOfUgc} UGCs with a total price of ${packageTotalPrice}.`,
        users: [customerId],
        metadata: {
            message: "This is a package notification",
            author: req.user.fullName,
            author_role: req.user.role,
        },
    };

    await sendNotification(notification);

    return res
        .status(201)
        .json(
            new ApiResponse(201, "Package created successfully", createdPackage)
        );
});

const getAllCustomPackages = asyncHandler(async (req, res) => {
    const packages = await Package.find().populate({
        path: "packageCustomer",
        select: "-password",
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
    const customerId = req.user;

    isValidId(customerId);

    const packages = await Package.find({
        packageCustomer: customerId,
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

    const packageData = await Package.findById(packageId).populate(
        "packageCustomer"
    );

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

    const updatedPackage = await updateById(Package, packageId, updateData);

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

    const deletedPackage = await deleteById(Package, packageId);

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
