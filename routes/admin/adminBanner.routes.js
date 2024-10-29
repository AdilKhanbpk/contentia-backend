import express from "express";
import {
  createBanner,
  deleteBanner,
  getBannerById,
  getBanners,
  updateBanner,
} from "../../controllers/admin/adminBanner.controller.js";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import { uploadOnMulter } from "../../middlewares/multer.middleware.js";

const router = express.Router();

router.get(
  "/",
  isAuthenticated,
  uploadOnMulter.single("bannerImage"),
  getBanners
);
router.post("/", isAuthenticated, createBanner);
router.patch(
  "/:bannerId",
  isAuthenticated,
  uploadOnMulter.single("bannerImage"),
  updateBanner
);
router.delete("/:bannerId", isAuthenticated, deleteBanner);
router.get("/:bannerId", isAuthenticated, getBannerById);

export default router;
