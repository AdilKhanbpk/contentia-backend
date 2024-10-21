import BannerModel from "../../models/admin/adminBanner.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

const createBanner = asyncHandler(async (req, res) => {});

const getBanners = asyncHandler(async (req, res) => {});

const getBannerById = asyncHandler(async (req, res) => {});

const updateBanner = asyncHandler(async (req, res) => {});

const deleteBanner = asyncHandler(async (req, res) => {});

export { createBanner, getBanners, getBannerById, updateBanner, deleteBanner };
