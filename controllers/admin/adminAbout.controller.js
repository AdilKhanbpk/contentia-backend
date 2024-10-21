// controllers/adminAboutController.js
import AboutModel from "../../models/admin/adminAbout.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

const createOrUpdateAbout = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required.");
  }

  let about = await AboutModel.findOne();

  if (about) {
    about.content = content;
    await about.save();
    return res
      .status(200)
      .json(new ApiResponse(200, about, "About content updated successfully"));
  }

  about = await AboutModel.create({ content });

  return res
    .status(201)
    .json(new ApiResponse(201, about, "About content created successfully"));
});

const getAbout = asyncHandler(async (req, res) => {
  const about = await AboutModel.findOne();

  if (!about) {
    throw new ApiError(404, "About content not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, about, "About content retrieved successfully"));
});

export { createOrUpdateAbout, getAbout };
