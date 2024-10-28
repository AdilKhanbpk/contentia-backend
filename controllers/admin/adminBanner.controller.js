import BannerModel from "../../models/admin/adminBanner.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  deleteImageFromCloudinary,
  uploadImageToCloudinary,
} from "../../utils/Cloudinary.js";
import { isValidId } from "../../utils/commonHelpers.js";
import {
  createADocument,
  deleteById,
  findAll,
  findById,
  updateById,
} from "../../utils/dbHelpers.js";

const createBanner = asyncHandler(async (req, res) => {
  const bannerImage = req.file?.path;

  if (!bannerImage) {
    throw new ApiError(400, "Please provide a banner image");
  }

  const uploadBanner = await uploadImageToCloudinary(bannerImage);

  const createdBanner = await createADocument(BannerModel, {
    bannerImage: uploadBanner.path,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, createdBanner, "Banner created successfully"));
});

const getBanners = asyncHandler(async (req, res) => {
  const banners = await findAll(BannerModel);

  return res
    .status(200)
    .json(new ApiResponse(200, banners, "Banners retrieved successfully"));
});

const getBannerById = asyncHandler(async (req, res) => {
  const { bannerId } = req.params;
  isValidId(bannerId);

  const banner = await findById(BannerModel, bannerId);

  return res
    .status(200)
    .json(new ApiResponse(200, banner, "Banner retrieved successfully"));
});

const updateBanner = asyncHandler(async (req, res) => {
  const { bannerId } = req.params;
  const bannerImage = req.file?.path;

  isValidId(bannerId);

  if (!bannerImage) {
    throw new ApiError(400, "Please provide a banner image");
  }

  const uploadedImage = await uploadImageToCloudinary(bannerImage);

  const updatedBanner = await updateById(BannerModel, bannerId, {
    bannerImage: uploadedImage.path,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBanner, "Banner updated successfully"));
});

const deleteBanner = asyncHandler(async (req, res) => {
  const { bannerId } = req.params;

  isValidId(bannerId);

  const banner = await findById(BannerModel, bannerId);

  const bannerImage = banner.bannerImage;

  await deleteImageFromCloudinary(bannerImage);

  const deletedBanner = await deleteById(BannerModel, bannerId);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedBanner, "Banner deleted successfully"));
});

export { createBanner, getBanners, getBannerById, updateBanner, deleteBanner };
