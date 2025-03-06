import Package from "../../models/admin/adminPackage.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";

const createLandingPagePackage = asyncHandler(async (req, res) => {
    const { title, description, price } = req.body;

    if (!title || !description || !price) {
        throw new ApiError(400, "All fields are required");
    }

    const packagesCount = await findAll(Package);
    if (packagesCount.length >= 3) {
        throw new ApiError(400, "You can create only 3 packages");
    }

    const newPackage = await Package.create({ title, description, price });

    return res
        .status(201)
        .json(new ApiResponse(201, newPackage, "Package created successfully"));
});

const getAllLandingPagePackages = asyncHandler(async (req, res) => {
    const packages = await Package.find()
    return res
        .status(200)
        .json(new ApiResponse(200, packages, "Packages fetched successfully"));
});

const getLandingPagePackageById = asyncHandler(async (req, res) => {
    const { packageId } = req.params;
    isValidId(packageId);

    const singlePackage = await Package.findById(packageId);

    return res
        .status(200)
        .json(
            new ApiResponse(200, singlePackage, "Package fetched successfully")
        );
});

const updateLandingPagePackage = asyncHandler(async (req, res) => {
    const { title, description, price } = req.body;
    const { packageId } = req.params;
    isValidId(packageId);

    const updatedPackage = await Package.findByIdAndUpdate(
        packageId,
        { title, description, price },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPackage, "Package updated successfully")
        );
});

const deleteLandingPagePackage = asyncHandler(async (req, res) => {
    const { packageId } = req.params;
    isValidId(packageId);

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
    createLandingPagePackage,
    getAllLandingPagePackages,
    getLandingPagePackageById,
    updateLandingPagePackage,
    deleteLandingPagePackage,
};
