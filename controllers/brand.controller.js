import BrandModel from "../models/brand.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    deleteFileFromCloudinary,
    uploadFileToCloudinary,
} from "../utils/Cloudinary.js";
import { isValidId } from "../utils/commonHelpers.js";
import {
    createADocument,
    deleteById,
    findAll,
    findById,
    updateById,
} from "../utils/dbHelpers.js";

const createBrand = asyncHandler(async (req, res) => {
    const { brandName, brandCategory, brandWebsite, brandCountry } = req.body;

    if (!brandName || !brandCategory || !brandCountry) {
        throw new ApiError(400, "Please provide all the required fields");
    }

    const createdBrand = await createADocument(BrandModel, {
        brandOwner: req.user._id,
        brandName,
        brandCategory,
        brandWebsite,
        brandCountry,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, createdBrand, "Brand created successfully"));
});

const getBrands = asyncHandler(async (req, res) => {
    const brands = await findAll(BrandModel);
    return res
        .status(200)
        .json(new ApiResponse(200, brands, "Brands retrieved successfully"));
});

const getSingleBrand = asyncHandler(async (req, res) => {
    const { brandId } = req.params;

    isValidId(brandId);

    const brand = await findById(BrandModel, brandId);

    return res
        .status(200)
        .json(new ApiResponse(200, brand, "Brand retrieved successfully"));
});

const updateBrand = asyncHandler(async (req, res) => {
    const { brandId } = req.params;
    const { brandName, brandCategory, brandWebsite, brandCountry } = req.body;

    isValidId(brandId);

    const updatedBrand = await updateById(BrandModel, brandId, {
        brandName,
        brandCategory,
        brandWebsite,
        brandCountry,
    });

    return res
        .status(200)
        .json(new ApiResponse(200, updatedBrand, "Brand updated successfully"));
});

const deleteBrand = asyncHandler(async (req, res) => {
    const { brandId } = req.params;

    isValidId(brandId);

    const deletedBrand = await deleteById(BrandModel, brandId);

    return res
        .status(200)
        .json(new ApiResponse(200, deletedBrand, "Brand deleted successfully"));
});

const getMyBrands = asyncHandler(async (req, res) => {
    const myBrands = await BrandModel.find({
        brandOwner: req.user._id,
    }).populate({
        path: "brandOwner",
        select: "-password",
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, myBrands, "My Brands retrieved successfully")
        );
});

const changeBrandPic = asyncHandler(async (req, res) => {
    const { brandId } = req.params;
    const filePath = req.file.path;
    // console.log(filePath);

    isValidId(brandId);

    if (!filePath) {
        throw new ApiError(400, "Please upload a file");
    }

    const brand = await BrandModel.findById(brandId);

    if (!brand) {
        throw new ApiError(404, "Brand not found");
    }

    if (brand.brandImage) {
        await deleteFileFromCloudinary(brand.brandImage);
    }

    const uploadedFile = await uploadFileToCloudinary(filePath);

    // console.log(uploadedFile);

    await brand.updateOne({
        $set: {
            brandImage: uploadedFile?.url,
        },
    });

    return res
        .status(200)
        .json(new ApiResponse(200, brand, "Brand Image updated successfully"));
});

export {
    createBrand,
    getBrands,
    getSingleBrand,
    updateBrand,
    deleteBrand,
    getMyBrands,
    changeBrandPic,
};
