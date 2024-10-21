import express from "express";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogs,
  updateBlog,
} from "../../controllers/admin/adminBlog.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getBlogs);
router.get("/:id", isAuthenticated, getBlogById);
router.post("/", isAuthenticated, createBlog);
router.put("/:id", isAuthenticated, updateBlog);
router.delete("/:id", isAuthenticated, deleteBlog);

export default router;
