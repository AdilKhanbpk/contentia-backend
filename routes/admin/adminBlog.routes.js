const express = require("express");
const { protect } = require("../../controllers/auth.controller");
const BlogController = require("../../controllers/admin/adminBlog.controller");

const router = express.Router();

router.get("/", protect, BlogController.getBlog);
router.get("/:id", protect, BlogController.getBlogById);
router.post("/", protect, BlogController.createBlog);
router.put("/:id", protect, BlogController.updateBlog);
router.delete("/:id", protect, BlogController.deleteBlog);

module.exports = router;
