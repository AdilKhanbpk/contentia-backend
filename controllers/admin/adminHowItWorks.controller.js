// controllers/adminHowItWorksController.js
import HowItWorksModel from "../../models/admin/adminHowItWorks.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

const createHowItWorks = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    throw new ApiError(400, "Title and Description are required.");
  }

  const newHowItWorks = await HowItWorksModel.create({ title, description });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        newHowItWorks,
        "How It Works section created successfully"
      )
    );
});

const getHowItWorks = asyncHandler(async (req, res) => {
  const howItWorks = await HowItWorksModel.find();
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        howItWorks,
        "How It Works sections retrieved successfully"
      )
    );
});

const getHowItWorksById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const howItWorks = await HowItWorksModel.findById(id);

  if (!howItWorks) {
    throw new ApiError(404, `How It Works section not found with id: ${id}`);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        howItWorks,
        "How It Works section retrieved successfully"
      )
    );
});

const updateHowItWorks = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const howItWorks = await HowItWorksModel.findById(id);

  if (!howItWorks) {
    throw new ApiError(404, `How It Works section not found with id: ${id}`);
  }

  howItWorks.title = title || howItWorks.title;
  howItWorks.description = description || howItWorks.description;

  await howItWorks.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        howItWorks,
        "How It Works section updated successfully"
      )
    );
});

const deleteHowItWorks = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const howItWorks = await HowItWorksModel.findById(id);

  if (!howItWorks) {
    throw new ApiError(404, `How It Works section not found with id: ${id}`);
  }

  await howItWorks.remove();

  return res
    .status(200)
    .json(
      new ApiResponse(200, null, "How It Works section deleted successfully")
    );
});

export {
  createHowItWorks,
  getHowItWorks,
  getHowItWorksById,
  updateHowItWorks,
  deleteHowItWorks,
};
