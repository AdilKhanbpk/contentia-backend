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
import {
    createADocument,
    deleteById,
    findById,
    findOne,
    updateById,
} from "../../utils/dbHelpers.js";

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

    const aboutImage = req.file.path;

    if (!aboutImage) {
        throw new ApiError(400, "Please provide an image");
    }

    const uploadImage = await uploadFileToCloudinary(aboutImage);

    const lengthOfAbout = await findAll(AboutModel);

    if (lengthOfAbout.length > 1) {
        throw new ApiError(400, "About cannot be created more than one");
    }

    const newAbout = await createADocument(AboutModel, {
        title,
        content,
        contactTitle,
        contactEmail,
        contactPhone,
        contactAddress,
        buttonUrl,
        aboutImage: uploadImage.url,
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

    const updatedAbout = await updateById(AboutModel, aboutId, {
        title,
        content,
        contactTitle,
        contactEmail,
        contactPhone,
        contactAddress,
        buttonUrl,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedAbout, "About updated successfully"));
});

const updateAboutImage = asyncHandler(async (req, res) => {
    const { aboutId } = req.params;
    const aboutImage = req.file.path;

    isValidId(aboutId);

    const about = await findById(AboutModel, aboutId);

    if (about.aboutImage) {
        await deleteFileFromCloudinary(about.aboutImage);
    }

    if (!aboutImage) {
        throw new ApiError(400, "Please provide an image");
    }

    const uploadImage = await uploadFileToCloudinary(aboutImage);

    const updatedAbout = await updateById(AboutModel, aboutId, {
        aboutImage: uploadImage.url,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedAbout, "About updated successfully"));
});

const getAbout = asyncHandler(async (req, res) => {
    const about = await findOne(AboutModel, {});

    return res
        .status(200)
        .json(new ApiResponse(200, about, "About retrieved successfully"));
});

const deleteAbout = asyncHandler(async (req, res) => {
    const { aboutId } = req.params;

    isValidId(aboutId);

    const about = await findById(AboutModel, aboutId);

    if (about.aboutImage) {
        await deleteFileFromCloudinary(about.aboutImage);
    }

    const deletedAbout = await deleteById(AboutModel, aboutId);

    return res
        .status(200)
        .json(new ApiResponse(200, deletedAbout, "About deleted successfully"));
});

export { createAbout, updateAbout, getAbout, updateAboutImage, deleteAbout };
