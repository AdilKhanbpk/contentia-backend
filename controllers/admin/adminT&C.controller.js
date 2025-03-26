import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import TermsAndConditionsModel from "../../models/admin/adminT&C.model.js";
import slugify from "slugify";

const createPage = asyncHandler(async (req, res) => {
    const { pageTitle, pageContent, pageCategory } = req.body;

    if (!pageTitle || !pageContent || !pageCategory) {
        throw new ApiError(400, "Please provide all the required fields");
    }


    const newPage = await TermsAndConditionsModel.create({
        pageTitle,
        pageContent,
        pageCategory,
    });

    return res.status(201).json(new ApiResponse(201, newPage, "Page created successfully"));
});

const getPages = asyncHandler(async (req, res) => {
    const pages = await TermsAndConditionsModel.find();

    return res.status(200).json(new ApiResponse(200, pages, "Pages retrieved successfully"));
});

const getPageBySlug = asyncHandler(async (req, res) => {
    const { termId } = req.params;

    const page = await TermsAndConditionsModel.findById(termId);
    if (!page) {
        throw new ApiError(404, "Page not found");
    }

    return res.status(200).json(new ApiResponse(200, page, "Page retrieved successfully"));
});

const updatePage = asyncHandler(async (req, res) => {
    const { termId } = req.params;
    isValidId(termId);

    const { pageTitle, pageContent, pageCategory } = req.body;

    const page = await TermsAndConditionsModel.findById(termId);
    if (!page) {
        throw new ApiError(404, "Page not found");
    }

    page.pageTitle = pageTitle;
    page.pageContent = pageContent;
    page.pageCategory = pageCategory;

    const updatedPage = await page.save();

    return res.status(200).json(new ApiResponse(200, updatedPage, "Page updated successfully"));
});


const deletePage = asyncHandler(async (req, res) => {
    const { termId } = req.params;
    isValidId(termId);

    const deletedPage = await TermsAndConditionsModel.findByIdAndDelete(termId);
    if (!deletedPage) {
        throw new ApiError(404, "Page not found");
    }

    return res.status(200).json(new ApiResponse(200, deletedPage, "Page deleted successfully"));
});

export { createPage, getPages, getPageBySlug, updatePage, deletePage };
