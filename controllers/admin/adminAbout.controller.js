const AboutModel = require("../../models/about.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const createOrUpdateAbout = asyncHandler(async (req, res, next) => {
  const { content } = req.body;

  if (!content) {
    return next(new ApiError(400, "Content is required."));
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

const getAbout = asyncHandler(async (req, res, next) => {
  const about = await AboutModel.findOne();

  if (!about) {
    return next(new ApiError(404, "About content not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, about, "About content retrieved successfully"));
});

module.exports = {
  createOrUpdateAbout,
  getAbout,
};
