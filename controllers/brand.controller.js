import BrandModel from "../models/brand.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
    deleteFileFromCloudinary,
    uploadFileToCloudinary,
} from "../utils/Cloudinary.js";
import { isValidId } from "../utils/commonHelpers.js";

const createBrand = asyncHandler(async (req, res) => {
    const { brandName, brandCategory, brandWebsite, brandCountry } = req.body;
    console.log("🚀 ~ createBrand ~ body:", req.body);

    if (!brandName || !brandCategory || !brandCountry) {
        throw new ApiError(400, "Please provide all the required fields");
    }

    let uploadedImage;
    if (req.file) {
        const image = req.file.path;
        console.log("🚀 ~ createBrand ~ image:", image);
        uploadedImage = await uploadFileToCloudinary(image);
    }
    const createdBrand = await BrandModel.create({
        brandOwner: req.user._id,
        brandName,
        brandCategory,
        brandWebsite,
        brandCountry,
        brandImage: uploadedImage?.secure_url,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, createdBrand, "Brand created successfully"));
});

const getBrands = asyncHandler(async (req, res) => {
    const brands = await BrandModel.find().sort({ createdAt: -1 });
    return res
        .status(200)
        .json(new ApiResponse(200, brands, "Brands retrieved successfully"));
});

const getSingleBrand = asyncHandler(async (req, res) => {
    const { brandId } = req.params;

    isValidId(brandId);

    const brand = await BrandModel.findById(brandId);

    return res
        .status(200)
        .json(new ApiResponse(200, brand, "Brand retrieved successfully"));
});

// const updateBrand = asyncHandler(async (req, res) => {
//     const { brandId } = req.params;
//     const { brandName, brandCategory, brandWebsite, brandCountry } = req.body;

//     isValidId(brandId);

//     const updatedBrand = await BrandModel.findByIdAndUpdate(
//         brandId,
//         { brandName, brandCategory, brandWebsite, brandCountry },
//         { new: true }
//     );

//     return res
//         .status(200)
//         .json(new ApiResponse(200, updatedBrand, "Brand updated successfully"));
// });

const updateBrand = asyncHandler(async (req, res) => {
    const { brandId } = req.params;
    const { brandName, brandCategory, brandWebsite, brandCountry } = req.body;

    // Validate ID
    isValidId(brandId);

    // Find the existing brand
    const brand = await BrandModel.findById(brandId);
    if (!brand) {
        throw new ApiError(404, "Brand not found");
    }

    // Check if an image file is uploaded
    let uploadedImage;
    if (req.file) {
        const imagePath = req.file.path;
        console.log("🚀 ~ updateBrand ~ imagePath:", imagePath);
        uploadedImage = await uploadFileToCloudinary(imagePath);
    }

    // Update brand details
    const updatedBrand = await BrandModel.findByIdAndUpdate(
        brandId,
        {
            $set: {
                brandName,
                brandCategory,
                brandWebsite,
                brandCountry,
                ...(uploadedImage && { brandImage: uploadedImage.secure_url }),
            },
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedBrand, "Brand updated successfully"));
});

const deleteBrand = asyncHandler(async (req, res) => {
    const { brandId } = req.params;

    isValidId(brandId);

    const deletedBrand = await BrandModel.findByIdAndDelete(brandId);

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
            brandImage: uploadedFile?.secure_url,
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
