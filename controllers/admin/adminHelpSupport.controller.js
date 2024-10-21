// controllers/adminHelpSupportController.js
import HelpSupportModel from "../../models/admin/adminHelpSupport.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

const createHelpSupport = asyncHandler(async (req, res) => {
  const { title, category, content } = req.body;

  if (!title || !category || !content) {
    throw new ApiError(400, "Title, Category, and Content are required.");
  }

  const newHelpSupport = await HelpSupportModel.create({
    title,
    category,
    content,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(201, newHelpSupport, "Help support created successfully")
    );
});

const getHelpSupports = asyncHandler(async (req, res) => {
  const helpSupports = await HelpSupportModel.find();
  return res
    .status(200)
    .json(
      new ApiResponse(200, helpSupports, "Help supports retrieved successfully")
    );
});

const getHelpSupportById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const helpSupport = await HelpSupportModel.findById(id);

  if (!helpSupport) {
    throw new ApiError(404, `Help support not found with id: ${id}`);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, helpSupport, "Help support retrieved successfully")
    );
});

const updateHelpSupport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, category, content } = req.body;
  const helpSupport = await HelpSupportModel.findById(id);

  if (!helpSupport) {
    throw new ApiError(404, `Help support not found with id: ${id}`);
  }

  helpSupport.title = title || helpSupport.title;
  helpSupport.category = category || helpSupport.category;
  helpSupport.content = content || helpSupport.content;

  await helpSupport.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, helpSupport, "Help support updated successfully")
    );
});

const deleteHelpSupport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const helpSupport = await HelpSupportModel.findById(id);

  if (!helpSupport) {
    throw new ApiError(404, `Help support not found with id: ${id}`);
  }

  await helpSupport.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Help support deleted successfully"));
});

export {
  createHelpSupport,
  getHelpSupports,
  getHelpSupportById,
  updateHelpSupport,
  deleteHelpSupport,
};
