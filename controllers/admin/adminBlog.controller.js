import BlogModel from "../../models/admin/adminBlog.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

const createBlog = asyncHandler(async (req, res) => {});

const getBlogs = asyncHandler(async (req, res) => {});

const getBlogById = asyncHandler(async (req, res) => {});

const updateBlog = asyncHandler(async (req, res) => {});

const deleteBlog = asyncHandler(async (req, res) => {});

export { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog };
