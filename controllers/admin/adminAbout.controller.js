// controllers/adminAboutController.js
import AboutModel from "../../models/admin/adminAbout.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
    deleteFileFromCloudinary,
    uploadFileToCloudinary,
} from "../../utils/Cloudinary.js";
import { isValidId } from "../../utils/commonHelpers.js";

const createAbout = asyncHandler(async (req, res) => {
    const {
        title,
        content,
        contactTitle,
        contactEmail,
        contactPhone,
        contactAddress,
        buttonUrl,
    } = req.body;

    // Check if req.file exists before accessing its properties
    if (!req.file) {
        throw new ApiError(400, "Please provide an image file");
    }

    const aboutImage = req.file.path;

    if (!aboutImage) {
        throw new ApiError(400, "Please provide a valid image");
    }

    const uploadImage = await uploadFileToCloudinary(aboutImage);

    const lengthOfAbout = await AboutModel.find({});

    if (lengthOfAbout.length > 0) {
        throw new ApiError(400, "About section already exists. Please update the existing one.");
    }

    const newAbout = await AboutModel.create({
        title,
        content,
        contactTitle,
        contactEmail,
        contactPhone,
        contactAddress,
        buttonUrl,
        aboutImage: uploadImage?.secure_url,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newAbout, "About created successfully"));
});

const updateAbout = asyncHandler(async (req, res) => {
    const { aboutId } = req.params;
    const {
        title,
        content,
        contactTitle,
        contactEmail,
        contactPhone,
        contactAddress,
        buttonUrl,
    } = req.body;

    isValidId(aboutId);

    const updatedAbout = await AboutModel.findOneAndUpdate(
        { _id: aboutId },
        {
            title,
            content,
            contactTitle,
            contactEmail,
            contactPhone,
            contactAddress,
            buttonUrl,
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedAbout, "About updated successfully"));
});

const updateAboutImage = asyncHandler(async (req, res) => {
    const { aboutId } = req.params;

    // Check if req.file exists before accessing its properties
    if (!req.file) {
        throw new ApiError(400, "Please provide an image file");
    }

    const aboutImage = req.file.path;

    isValidId(aboutId);

    const about = await AboutModel.findById(aboutId);

    if (!about) {
        throw new ApiError(404, "About section not found");
    }

    // Delete old image if it exists
    if (about.aboutImage) {
        try {
            await deleteFileFromCloudinary(about.aboutImage);
        } catch (error) {
            console.error("Error deleting old image:", error);
            // Continue even if deletion fails
        }
    }

    if (!aboutImage) {
        throw new ApiError(400, "Please provide a valid image");
    }

    const uploadImage = await uploadFileToCloudinary(aboutImage);

    if (!uploadImage || !uploadImage.secure_url) {
        throw new ApiError(500, "Failed to upload image to cloud storage");
    }

    const updatedAbout = await AboutModel.findOneAndUpdate(
        { _id: aboutId },
        {
            aboutImage: uploadImage.secure_url,
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedAbout, "About image updated successfully"));
});

const getAbout = asyncHandler(async (req, res) => {
    const about = await AboutModel.findOne({});

    return res
        .status(200)
        .json(new ApiResponse(200, about, "About retrieved successfully"));
});

const deleteAbout = asyncHandler(async (req, res) => {
    const { aboutId } = req.params;

    isValidId(aboutId);

    const about = await AboutModel.findById(aboutId);

    if (about.aboutImage) {
        await deleteFileFromCloudinary(about.aboutImage);
    }

    const deletedAbout = await AboutModel.findByIdAndDelete(aboutId);

    return res
        .status(200)
        .json(new ApiResponse(200, deletedAbout, "About deleted successfully"));
});

export { createAbout, updateAbout, getAbout, updateAboutImage, deleteAbout };
