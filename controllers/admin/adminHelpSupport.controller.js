// controllers/adminHelpSupportController.js
import HelpSupportModel from "../../models/admin/adminHelpSupport.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import {
    deleteFileFromCloudinary,
    uploadFileToCloudinary,
} from "../../utils/Cloudinary.js";

const createHelpSupport = asyncHandler(async (req, res) => {
    const { title, category, content } = req.body;

    if (!title || !category || !content) {
        throw new ApiError(400, "Title, Category, and Content are required.");
    }

    const icon = req.file?.path;

    if (!icon) {
        throw new ApiError(400, "Icon is required.");
    }

    const uploadedImage = await uploadFileToCloudinary(icon);

    const newHelpSupport = await HelpSupportModel.create({
        title,
        category,
        content,
        icon: uploadedImage?.secure_url,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                newHelpSupport,
                "Help support created successfully"
            )
        );
});

const getHelpSupports = asyncHandler(async (req, res) => {
    const helpSupports = await HelpSupportModel.find();
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                helpSupports,
                "Help supports retrieved successfully"
            )
        );
});

const getHelpSupportById = asyncHandler(async (req, res) => {
    const { helpSupportId } = req.params;
    isValidId(helpSupportId);

    const helpSupport = await HelpSupportModel.findById(helpSupportId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                helpSupport,
                "Help support retrieved successfully"
            )
        );
});

const updateHelpSupport = asyncHandler(async (req, res) => {
    const { helpSupportId } = req.params;
    const { title, category, content } = req.body;

    isValidId(helpSupportId);
    const helpSupport = await HelpSupportModel.findById(helpSupportId);

    if (!helpSupport) {
        throw new ApiError(404, "Help support not found.");
    }

    const updatePayload = {
        title,
        category,
        content,
    };

    if (req.file) {
        if (helpSupport.icon) {
            await deleteFileFromCloudinary(helpSupport.icon);
        }

        const icon = req.file.path;

        if (!icon) {
            throw new ApiError(400, "Icon is required.");
        }

        const uploadedImage = await uploadFileToCloudinary(icon);
        updatePayload.icon = uploadedImage?.secure_url;
    }

    const updatedHelpSupport = await HelpSupportModel.findByIdAndUpdate(
        helpSupportId,
        updatePayload,
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedHelpSupport,
                "Help support updated successfully"
            )
        );
});



const deleteHelpSupport = asyncHandler(async (req, res) => {
    const { helpSupportId } = req.params;

    isValidId(helpSupportId);

    const helpSupport = await HelpSupportModel.findById(helpSupportId);

    const iconPath = helpSupport.icon;

    await deleteFileFromCloudinary(iconPath);

    const deletedHelpSupport = await HelpSupportModel.findByIdAndDelete(
        helpSupportId
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedHelpSupport,
                "Help support deleted successfully"
            )
        );
});

export {
    createHelpSupport,
    getHelpSupports,
    getHelpSupportById,
    updateHelpSupport,
    deleteHelpSupport,
};
