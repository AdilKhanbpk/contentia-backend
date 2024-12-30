import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import PageModel from "../../models/admin/adminT&C.model.js";
import {
    createADocument,
    deleteById,
    findAll,
    findById,
    findByQuery,
    updateById,
} from "../../utils/dbHelpers.js";

const createAPage = asyncHandler(async (req, res) => {
    const { pageTitle, pageContent, pageUrl } = req.body;

    if (!title || !content || !url) {
        throw new ApiError(400, "Please provide all the required fields");
    }

    const newPage = await createADocument(PageModel, {
        pageTitle,
        pageContent,
        pageUrl,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newPage, "Page created successfully"));
});

const getPages = asyncHandler(async (req, res) => {
    const pages = await findAll(PageModel);

    return res
        .status(200)
        .json(new ApiResponse(200, pages, "Pages retrieved successfully"));
});

const getPageById = asyncHandler(async (req, res) => {
    const { pageId } = req.params;

    isValidId(pageId);

    const page = await findById(PageModel, pageId);

    return res
        .status(200)
        .json(new ApiResponse(200, page, "Page retrieved successfully"));
});

const updatePage = asyncHandler(async (req, res) => {
    const { pageId } = req.params;

    isValidId(pageId);

    const { pageTitle, pageContent, pageUrl } = req.body;

    const updatedPage = await updateById(PageModel, pageId, {
        pageTitle,
        pageContent,
        pageUrl,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPage, "Page updated successfully"));
});

const deletePage = asyncHandler(async (req, res) => {
    const { pageId } = req.params;

    isValidId(pageId);

    const deletedPage = await deleteById(PageModel, pageId);

    return res
        .status(200)
        .json(new ApiResponse(200, deletedPage, "Page deleted successfully"));
});

export { createAPage, getPages, getPageById, updatePage, deletePage };
