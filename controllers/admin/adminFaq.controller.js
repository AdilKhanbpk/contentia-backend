const FaqModel = require("../../models/admin/adminFaq.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

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
  const { id } = req.params;
  const faq = await FaqModel.findById(id);

  if (!faq) {
    throw new ApiError(404, `FAQ not found with id: ${id}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, faq, "FAQ retrieved successfully"));
});

const updateFaq = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { question, answer } = req.body;
  const faq = await FaqModel.findById(id);

  if (!faq) {
    throw new ApiError(404, `FAQ not found with id: ${id}`);
  }

  faq.question = question || faq.question;
  faq.answer = answer || faq.answer;

  await faq.save();

  return res
    .status(200)
    .json(new ApiResponse(200, faq, "FAQ updated successfully"));
});

const deleteFaq = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const faq = await FaqModel.findById(id);

  if (!faq) {
    throw new ApiError(404, `FAQ not found with id: ${id}`);
  }

  await faq.remove();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "FAQ deleted successfully"));
});

module.exports = {
  createFaq,
  getFaqs,
  getFaqById,
  updateFaq,
  deleteFaq,
};
