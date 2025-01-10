import BannerModel from "../../models/admin/adminBanner.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
    deleteFileFromCloudinary,
    uploadFileToCloudinary,
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
    const { bannerUrl } = req.body;
    const bannerImage = req.file?.path;

    if (!bannerUrl) {
        throw new ApiError(400, "Please provide a banner url");
    }

    if (!bannerImage) {
        throw new ApiError(400, "Please provide a banner image");
    }

    const banners = await findAll(BannerModel);

    if (banners.length >= 3) {
        throw new ApiError(400, "You can only have 3 banners");
    }

    const uploadBanner = await uploadFileToCloudinary(bannerImage);

    const createdBanner = await createADocument(BannerModel, {
        bannerUrl,
        bannerImage: uploadBanner?.secure_url,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(201, createdBanner, "Banner created successfully")
        );
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
    const { bannerUrl } = req.body;
    const bannerImage = req.file?.path;

    isValidId(bannerId);

    const banner = await findById(BannerModel, bannerId);

    const updateData = {};

    if (bannerUrl && bannerUrl !== banner.bannerUrl) {
        updateData.bannerUrl = bannerUrl;
    }

    if (bannerImage) {
        if (banner.bannerImage) {
            await deleteFileFromCloudinary(banner.bannerImage);
        }

        const uploadedImage = await uploadFileToCloudinary(bannerImage);
        updateData.bannerImage = uploadedImage.url;
    }

    if (!Object.keys(updateData).length) {
        throw new ApiError(
            400,
            "Please provide either a banner image or URL to update"
        );
    }

    const updatedBanner = await updateById(BannerModel, bannerId, updateData);

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedBanner, "Banner updated successfully")
        );
});

const deleteBanner = asyncHandler(async (req, res) => {
    const { bannerId } = req.params;

    isValidId(bannerId);

    const banner = await findById(BannerModel, bannerId);

    const bannerImage = banner.bannerImage;

    await deleteFileFromCloudinary(bannerImage);

    const deletedBanner = await deleteById(BannerModel, bannerId);

    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedBanner, "Banner deleted successfully")
        );
});

export { createBanner, getBanners, getBannerById, updateBanner, deleteBanner };
