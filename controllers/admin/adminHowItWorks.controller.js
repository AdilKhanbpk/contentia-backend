// controllers/adminHowItWorksController.js
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import HowItWorkModel from "../../models/admin/adminHowItworks.model.js";
import {
  createADocument,
  findAll,
  findById,
  updateById,
} from "../../utils/dbHelpers.js";

const createHowItWorks = asyncHandler(async (req, res) => {
  const { sectionTitle, sectionDescription, steps } = req.body;

  if (
    !sectionTitle ||
    !sectionDescription ||
    !Array.isArray(steps) ||
    steps.length === 0
  ) {
    throw new ApiError(
      400,
      "Section Title, Description, and at least one Step are required."
    );
  }

  const newHowItWorks = await createADocument(HowItWorkModel, {
    sectionTitle,
    sectionDescription,
    steps,
  });

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
  const howItWorks = await findAll(HowItWorkModel);
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
  const { howItWorksId } = req.params;
  const howItWorks = await findById(HowItWorkModel, howItWorksId);
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

const updateStepInHowItWorks = asyncHandler(async (req, res) => {
  const { howItWorksId } = req.params;
  const { sectionTitle, sectionDescription, steps } = req.body;

  if (!sectionTitle && !sectionDescription && !steps) {
    throw new ApiError(
      400,
      "At least one of sectionTitle, sectionDescription, or steps is required."
    );
  }

  if (steps && steps.length > 4) {
    throw new ApiError(400, "The steps array must contain up to 4 items.");
  }

  const updateFields = {};

  if (sectionTitle) updateFields.sectionTitle = sectionTitle;
  if (sectionDescription) updateFields.sectionDescription = sectionDescription;

  if (steps) updateFields.steps = steps;

  const updatedHowItWorks = await updateById(HowItWorkModel, howItWorksId, {
    ...updateFields,
  });

  if (!updatedHowItWorks) {
    throw new ApiError(
      404,
      `How It Works section not found with howItWorksId: ${howItWorksId}`
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedHowItWorks,
        "How It Works section updated successfully"
      )
    );
});

const deleteHowItWorks = asyncHandler(async (req, res) => {
  const { howItWorksId } = req.params;
  const howItWorks = await HowItWorkModel.findByIdAndDelete(howItWorksId);

  if (!howItWorks) {
    throw new ApiError(
      404,
      `How It Works section not found with howItWorksId: ${howItWorksId}`
    );
  }

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
  updateStepInHowItWorks,
  deleteHowItWorks,
};
