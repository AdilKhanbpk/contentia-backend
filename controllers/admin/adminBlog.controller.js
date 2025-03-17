import BlogModel from "../../models/admin/adminBlog.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
    deleteFileFromCloudinary,
    uploadFileToCloudinary,
} from "../../utils/Cloudinary.js";
import { isValidId } from "../../utils/commonHelpers.js";

const createBlog = asyncHandler(async (req, res) => {
    const { title, category, metaKeywords, metaDescription, content } =
        req.body;

    if (!title || !category || !metaKeywords || !metaDescription || !content) {
        throw new ApiError(400, "Please provide all the required fields");
    }

    if (typeof metaKeywords === "string") {
        metaKeywords = metaKeywords.split(",").map(keyword => keyword.trim());
    }

    const existedBlog = await BlogModel.find({ title });

    if (existedBlog.length > 0) {
        throw new ApiError(400, "Blog with this title already exists");
    }

    const blogImage = req.file?.path;
    if (!blogImage) {
        throw new ApiError(400, "Please provide a banner image");
    }

    const uploadImage = await uploadFileToCloudinary(blogImage);

    const createdBlog = await BlogModel.create({
        title,
        author: req.user?._id,
        category,
        metaKeywords,
        metaDescription,
        content,
        bannerImage: uploadImage?.secure_url,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, createdBlog, "Blog created successfully!"));
});

const getBlogs = asyncHandler(async (req, res) => {
    const blogs = await BlogModel.find().populate({
        path: "author",
        select: "-password",
    });
    return res
        .status(200)
        .json(new ApiResponse(200, blogs, "Blogs fetched successfully!"));
});

const getBlogById = asyncHandler(async (req, res) => {
    const { blogId } = req.params;

    isValidId(blogId);

    const blog = await BlogModel.findById(blogId).populate({
        path: "author",
        select: "-password",
    });

    return res
        .status(200)
        .json(new ApiResponse(200, blog, "Blog fetched successfully!"));
});

const updateBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.params;
    isValidId(blogId);

    let { title, category, metaKeywords, metaDescription, content } = req.body;

    if (!title || !category || !metaDescription || !content) {
        throw new ApiError(400, "Please provide all the required fields");
    }

    // Fetch existing blog
    const existingBlog = await BlogModel.findById(blogId);
    if (!existingBlog) {
        throw new ApiError(404, "Blog not found");
    }

    let updatedFields = {
        title,
        category,
        metaDescription,
        content,
    };

    // Handle `metaKeywords` conversion (ensure it's always an array)
    if (metaKeywords !== undefined) {
        if (typeof metaKeywords === "string") {
            metaKeywords = metaKeywords.split(",").map(keyword => keyword.trim());
        }
        updatedFields.metaKeywords = metaKeywords;
    } else {
        updatedFields.metaKeywords = existingBlog.metaKeywords; // Preserve old value
    }

    // Update banner image only if a new file is uploaded
    if (req.file) {
        const blogImage = req.file.path;
        const uploadedImage = await uploadFileToCloudinary(blogImage);
        updatedFields.bannerImage = uploadedImage?.secure_url;
    }

    const updatedBlog = await BlogModel.findByIdAndUpdate(blogId, updatedFields, { new: true });

    return res.status(200).json(new ApiResponse(200, updatedBlog, "Blog updated successfully!"));
});





const updateBannerImageOfBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.params;

    isValidId(blogId);

    const blogImage = req.file.path;

    if (!blogImage) {
        throw new ApiError(400, "Please provide a banner image");
    }

    const uploadedImage = await uploadFileToCloudinary(blogImage);

    const updatedBannerImageOfBlog = await BlogModel.findByIdAndUpdate(
        blogId,
        {
            bannerImage: uploadedImage?.secure_url,
        },
        { new: true }
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedBannerImageOfBlog,
                "Banner image updated successfully!"
            )
        );
});

const deleteBlog = asyncHandler(async (req, res) => {
    const { blogId } = req.params;

    isValidId(blogId);

    const blog = await BlogModel.findById(blogId);

    const blogBannerImage = blog.bannerImage;

    await deleteFileFromCloudinary(blogBannerImage);

    const deletedBlog = await BlogModel.findByIdAndDelete(blogId);

    return res
        .status(200)
        .json(new ApiResponse(200, deletedBlog, "Blog deleted successfully!"));
});

export {
    createBlog,
    getBlogs,
    getBlogById,
    updateBlog,
    updateBannerImageOfBlog,
    deleteBlog,
};
