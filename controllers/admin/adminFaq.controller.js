import FaqModel from "../../models/admin/adminFaq.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import { updateById } from "../../utils/dbHelpers.js";

const createFaq = asyncHandler(async (req, res, next) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    throw new ApiError(400, "Question and Answer are required.");
  }

  const newFaq = await FaqModel.create({ question, answer });

  return res
    .status(201)
    .json(new ApiResponse(201, newFaq, "FAQ created successfully"));
});

const getFaqs = asyncHandler(async (req, res) => {
  const faqs = await FaqModel.find();
  return res
    .status(200)
    .json(new ApiResponse(200, faqs, "FAQs retrieved successfully"));
});

const getFaqById = asyncHandler(async (req, res, next) => {
  const { faqId } = req.params;
  const faq = await FaqModel.findById(faqId);

  if (!faq) {
    throw new ApiError(404, `FAQ not found with faqId: ${faqId}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, faq, "FAQ retrieved successfully"));
});

const updateFaq = asyncHandler(async (req, res, next) => {
  const { faqId } = req.params;
  const { question, answer } = req.body;

  isValidId(faqId);

  const faq = await updateById(FaqModel, faqId, { question, answer });

  return res
    .status(200)
    .json(new ApiResponse(200, faq, "FAQ updated successfully"));
});

const deleteFaq = asyncHandler(async (req, res, next) => {
  const { faqId } = req.params;
  const faq = await FaqModel.findByIdAndDelete(faqId);

  if (!faq) {
    throw new ApiError(404, `FAQ not found with faqId: ${faqId}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "FAQ deleted successfully"));
});

export { createFaq, getFaqs, getFaqById, updateFaq, deleteFaq };
