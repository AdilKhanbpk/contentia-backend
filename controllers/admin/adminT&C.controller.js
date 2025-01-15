import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import PageModel from "../../models/admin/adminT&C.model.js";

const createAPage = asyncHandler(async (req, res) => {
    const { pageTitle, pageContent, pageUrl } = req.body;

    if (!title || !content || !url) {
        throw new ApiError(400, "Please provide all the required fields");
    }

    const newPage = await PageModel.create({
        pageTitle,
        pageContent,
        pageUrl,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newPage, "Page created successfully"));
});

const getPages = asyncHandler(async (req, res) => {
    const pages = await PageModel.find().sort({ createdAt: -1 });

    return res
        .status(200)
        .json(new ApiResponse(200, pages, "Pages retrieved successfully"));
});

const getPageById = asyncHandler(async (req, res) => {
    const { pageId } = req.params;

    isValidId(pageId);

    const page = await PageModel.findById(pageId);

    return res
        .status(200)
        .json(new ApiResponse(200, page, "Page retrieved successfully"));
});

const updatePage = asyncHandler(async (req, res) => {
    const { pageId } = req.params;

    isValidId(pageId);

    const { pageTitle, pageContent, pageUrl } = req.body;

    const updatedPage = await PageModel.findByIdAndUpdate(
        pageId,
        { pageTitle, pageContent, pageUrl },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPage, "Page updated successfully"));
});

const deletePage = asyncHandler(async (req, res) => {
    const { pageId } = req.params;

    isValidId(pageId);

    const deletedPage = await PageModel.findByIdAndDelete(pageId);

    return res
        .status(200)
        .json(new ApiResponse(200, deletedPage, "Page deleted successfully"));
});

export { createAPage, getPages, getPageById, updatePage, deletePage };
