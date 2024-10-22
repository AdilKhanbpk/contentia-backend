import express from "express";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
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

router.get("/", isAuthenticated, getBlogs);
router.get("/:blogId", isAuthenticated, getBlogById);
router.post(
  "/",
  isAuthenticated,
  uploadOnMulter.single("bannerImage"),
  createBlog
);
router.patch("/:blogId", isAuthenticated, updateBlog);

router.patch(
  "/:blogId/bannerImage",
  isAuthenticated,
  uploadOnMulter.single("bannerImage"),
  updateBannerImageOfBlog
);

router.delete("/:blogId", isAuthenticated, deleteBlog);

export default router;
