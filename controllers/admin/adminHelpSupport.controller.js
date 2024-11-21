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
import {
  createADocument,
  deleteById,
  findAll,
  findById,
  updateById,
} from "../../utils/dbHelpers.js";

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

  const newHelpSupport = await createADocument(HelpSupportModel, {
    title,
    category,
    content,
    icon: uploadedImage?.url,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newHelpSupport, "Help support created successfully")
    );
});

const getHelpSupports = asyncHandler(async (req, res) => {
  const helpSupports = await findAll(HelpSupportModel);
  return res
    .status(200)
    .json(
      new ApiResponse(200, helpSupports, "Help supports retrieved successfully")
    );
});

const getHelpSupportById = asyncHandler(async (req, res) => {
  const { helpSupportId } = req.params;
  isValidId(helpSupportId);

  const helpSupport = await findById(HelpSupportModel, helpSupportId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, helpSupport, "Help support retrieved successfully")
    );
});

const updateHelpSupport = asyncHandler(async (req, res) => {
  const { helpSupportId } = req.params;
  const { title, category, content } = req.body;

  isValidId(helpSupportId);

  const updatedHelpSupport = await updateById(HelpSupportModel, helpSupportId, {
    title,
    category,
    content,
  });

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

const updateHelpSupportIcon = asyncHandler(async (req, res) => {
  const { helpSupportId } = req.params;

  isValidId(helpSupportId);

  const helpSupport = await findById(HelpSupportModel, helpSupportId);

  if (helpSupport.icon) {
    await deleteFileFromCloudinary(helpSupport.icon);
  }

  const icon = req.file?.path;

  if (!icon) {
    throw new ApiError(400, "Icon is required.");
  }

  const uploadedImage = await uploadFileToCloudinary(icon);

  const updatedHelpSupport = await updateById(HelpSupportModel, helpSupportId, {
    icon: uploadedImage?.url,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedHelpSupport,
        "Help support icon updated successfully"
      )
    );
});

const deleteHelpSupport = asyncHandler(async (req, res) => {
  const { helpSupportId } = req.params;

  isValidId(helpSupportId);

  const helpSupport = await findById(HelpSupportModel, helpSupportId);

  const iconPath = helpSupport.icon;

  await deleteFileFromCloudinary(iconPath);

  const deletedHelpSupport = await deleteById(HelpSupportModel, helpSupportId);

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
  updateHelpSupportIcon,
  deleteHelpSupport,
};
