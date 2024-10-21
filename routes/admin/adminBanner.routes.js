import express from "express";
import {
  createBanner,
  deleteBanner,
  getBannerById,
  getBanners,
  updateBanner,
} from "../../controllers/admin/adminBanner.controller.js";
import { protect } from "../../controllers/auth.controller.js";

const router = express.Router();

router.get("/", protect, getBanners);
router.post("/", protect, createBanner);
router.put("/:id", protect, updateBanner);
router.delete("/:id", protect, deleteBanner);
router.get("/:id", protect, getBannerById);

export default router;
