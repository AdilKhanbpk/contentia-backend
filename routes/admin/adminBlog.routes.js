import express from "express";
import { protect } from "../../controllers/auth.controller.js";
import {
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogs,
  updateBlog,
} from "../../controllers/admin/adminBlog.controller.js";

const router = express.Router();

router.get("/", protect, getBlogs);
router.get("/:id", protect, getBlogById);
router.post("/", protect, createBlog);
router.put("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

export default router;
