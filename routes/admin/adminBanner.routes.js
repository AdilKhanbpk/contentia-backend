import express from "express";
import {
  createBanner,
  deleteBanner,
  getBannerById,
  getBanners,
  updateBanner,
} from "../../controllers/admin/adminBanner.controller.js";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";

const router = express.Router();

router.get("/", isAuthenticated, getBanners);
router.post("/", isAuthenticated, createBanner);
router.put("/:id", isAuthenticated, updateBanner);
router.delete("/:id", isAuthenticated, deleteBanner);
router.get("/:id", isAuthenticated, getBannerById);

export default router;
