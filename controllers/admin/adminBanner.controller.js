const BannerModel = require("../../models/admin/adminBanner.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const createBanner = asyncHandler(async (req, res) => {});

const getBanners = asyncHandler(async (req, res) => {});

const getBannerById = asyncHandler(async (req, res) => {});

const updateBanner = asyncHandler(async (req, res) => {});

const deleteBanner = asyncHandler(async (req, res) => {});

module.exports = {
  createBanner,
  getBanners,
  getBannerById,
  updateBanner,
  deleteBanner,
};
