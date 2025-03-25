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
    const pages = await TermsAndConditionsModel.find().sort({ createdAt: -1 });

    return res.status(200).json(new ApiResponse(200, pages, "Pages retrieved successfully"));
});

const getPageBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;
    console.log("🚀 ~ getPageBySlug ~ slug:", slug)

    const page = await TermsAndConditionsModel.findOne({ pageSlug: slug });
    if (!page) {
        throw new ApiError(404, "Page not found");
    }

    return res.status(200).json(new ApiResponse(200, page, "Page retrieved successfully"));
});

const updatePage = asyncHandler(async (req, res) => {
    const { pageId } = req.params;
    isValidId(pageId);

    const { pageTitle, pageContent, pageCategory } = req.body;
    let updateData = { pageContent, pageCategory };

    if (pageTitle) {
        updateData.pageTitle = pageTitle;
        updateData.slug = `${pageCategory}/${slugify(pageTitle, { lower: true, strict: true })}`;
    }

    const updatedPage = await TermsAndConditionsModel.findByIdAndUpdate(
        pageId,
        updateData,
        { new: true }
    );

    if (!updatedPage) {
        throw new ApiError(404, "Page not found");
    }

    return res.status(200).json(new ApiResponse(200, updatedPage, "Page updated successfully"));
});

const deletePage = asyncHandler(async (req, res) => {
    const { pageId } = req.params;
    isValidId(pageId);

    const deletedPage = await TermsAndConditionsModel.findByIdAndDelete(pageId);
    if (!deletedPage) {
        throw new ApiError(404, "Page not found");
    }

    return res.status(200).json(new ApiResponse(200, deletedPage, "Page deleted successfully"));
});

export { createPage, getPages, getPageBySlug, updatePage, deletePage };
