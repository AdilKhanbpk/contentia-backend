import BlogModel from "../../models/admin/adminBlog.model.js";
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
  findByQuery,
  updateById,
  deleteById,
  findById,
  findAll,
} from "../../utils/dbHelpers.js";

const createBlog = asyncHandler(async (req, res) => {
  const { title, category, metaKeywords, metaDescription, content } = req.body;

  if (!title || !category || !metaKeywords || !metaDescription || !content) {
    throw new ApiError(400, "Please provide all the required fields");
  }

  const existedBlog = await findByQuery(BlogModel, { title });
  if (existedBlog.length > 0) {
    throw new ApiError(400, "Blog already exists");
  }

  const blogImage = req.file?.path;
  if (!blogImage) {
    throw new ApiError(400, "Please provide a banner image");
  }

  const uploadImage = await uploadFileToCloudinary(blogImage);

  const createdBlog = await createADocument(BlogModel, {
    author: req.user._id,
    title,
    category,
    metaKeywords,
    metaDescription,
    content,
    bannerImage: uploadImage.path,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, createdBlog, "Blog created successfully!"));
});

const getBlogs = asyncHandler(async (req, res) => {
  const blogs = await findAll(BlogModel);
  return res
    .status(200)
    .json(new ApiResponse(200, blogs, "Blogs fetched successfully!"));
});

const getBlogById = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  isValidId(blogId);

  const blog = await findById(BlogModel, blogId);

  return res
    .status(200)
    .json(new ApiResponse(200, blog, "Blog fetched successfully!"));
});

const updateBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  isValidId(blogId);

  const { title, category, metaKeywords, metaDescription, content } = req.body;

  if (!title || !category || !metaKeywords || !metaDescription || !content) {
    throw new ApiError(400, "Please provide all the required fields");
  }

  const updatedBlog = await updateById(BlogModel, blogId, {
    title,
    category,
    metaKeywords,
    metaDescription,
    content,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBlog, "Blog updated successfully!"));
});

const updateBannerImageOfBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  isValidId(blogId);

  const blogImage = req.file.path;

  if (!blogImage) {
    throw new ApiError(400, "Please provide a banner image");
  }

  const uploadedImage = await uploadFileToCloudinary(blogImage);

  const updatedBannerImageOfBlog = await updateById(BlogModel, blogId, {
    bannerImage: uploadedImage.path,
  });

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

  const blog = await findById(BlogModel, blogId);

  const blogBannerImage = blog.bannerImage;

  await deleteFileFromCloudinary(blogBannerImage);

  const deletedBlog = await deleteById(BlogModel, blogId);

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
