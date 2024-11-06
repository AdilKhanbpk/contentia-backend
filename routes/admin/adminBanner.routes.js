import express from "express";
import {
  createBanner,
  deleteBanner,
  getBannerById,
  getBanners,
  updateBanner,
} from "../../controllers/admin/adminBanner.controller.js";
import {
  isAuthenticated,
  isAdmin,
} from "../../middlewares/authentication.middleware.js";
import { uploadOnMulter } from "../../middlewares/multer.middleware.js";

const router = express.Router();

router.get(
  "/",
  isAuthenticated,
  uploadOnMulter.single("bannerImage"),
  getBanners
);
router.post(
  "/",
  isAuthenticated,
  isAdmin,
  uploadOnMulter.single("bannerImage"),
  createBanner
);
router.patch(
  "/:bannerId",
  isAuthenticated,
  isAdmin,
  uploadOnMulter.single("bannerImage"),
  updateBanner
);
router.delete("/:bannerId", isAuthenticated, isAdmin, deleteBanner);
router.get("/:bannerId", isAuthenticated, isAdmin, getBannerById);

export default router;
