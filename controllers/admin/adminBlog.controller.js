import BlogModel from "../../models/admin/adminBlog.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  createADocument,
  findByQuery,
  updateById,
  deleteById,
  findById,
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

  const bannerImage = req.file?.path;
  if (!bannerImage) {
    throw new ApiError(400, "Please provide a banner image");
  }

  const createdBlog = await createADocument(BlogModel, {
    author: req.user._id,
    title,
    category,
    metaKeywords,
    metaDescription,
    content,
    bannerImage,
  });

  await createdBlog.save();

  return res
    .status(201)
    .json(new ApiResponse(201, createdBlog, "Blog created successfully!"));
});

const getBlogs = asyncHandler(async (req, res) => {
  const blogs = await findByQuery(BlogModel, {});

  if (!blogs || blogs.length === 0) {
    throw new ApiError(404, "No blogs found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, blogs, "Blogs fetched successfully!"));
});

const getBlogById = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  if (!blogId) {
    throw new ApiError(400, "Please provide a blog ID");
  }

  const blog = await findById(BlogModel, blogId);

  if (!blog) {
    throw new ApiError(404, "Blog not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, blog, "Blog fetched successfully!"));
});

const updateBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  if (!blogId) {
    throw new ApiError(400, "Please provide a blog ID");
  }

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

  if (!updatedBlog) {
    throw new ApiError(404, "Blog not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedBlog, "Blog updated successfully!"));
});

const updateBannerImageOfBlog = asyncHandler(async (req, res) => {
  const { blogId } = req.params;

  if (!blogId) {
    throw new ApiError(400, "Please provide a blog ID");
  }

  const bannerImage = req.file;

  if (!bannerImage) {
    throw new ApiError(400, "Please provide a banner image");
  }

  const updatedBannerImageOfBlog = await updateById(BlogModel, blogId, {
    bannerImage: bannerImage.path,
  });

  if (!updatedBannerImageOfBlog) {
    throw new ApiError(404, "Blog not found");
  }

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

  if (!blogId) {
    throw new ApiError(400, "Please provide a blog ID");
  }

  const deletedBlog = await deleteById(BlogModel, blogId);

  if (!deletedBlog) {
    throw new ApiError(404, "Blog not found");
  }

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
