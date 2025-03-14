import express from "express";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
    createBlog,
    deleteBlog,
    getBlogById,
    getBlogs,
    updateBlog,
    updateBannerImageOfBlog,
} from "../../controllers/admin/adminBlog.controller.js";
import { uploadOnMulter } from "../../middlewares/multer.middleware.js";

const router = express.Router();

// GET Routes
router.get("/", isAuthenticated, getBlogs);
router.get("/:blogId", isAuthenticated, isAdmin, getBlogById);

// POST Routes
router.post(
    "/",
    isAuthenticated,
    isAdmin,
    uploadOnMulter.single("bannerImage"),
    createBlog
);

// PATCH Routes
router.patch("/:blogId", isAuthenticated, isAdmin, uploadOnMulter.single("bannerImage"),
    updateBlog);
router.patch(
    "/:blogId/bannerImage",
    isAuthenticated,
    isAdmin,
    uploadOnMulter.single("bannerImage"),
    updateBannerImageOfBlog
);

// DELETE Routes
router.delete("/:blogId", isAuthenticated, isAdmin, deleteBlog);

export default router;
