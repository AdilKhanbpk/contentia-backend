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

// GET Routes
router.get("/", isAuthenticated, getBanners);
router.get("/:bannerId", isAuthenticated, isAdmin, getBannerById);

// POST Routes
router.post(
    "/",
    isAuthenticated,
    isAdmin,
    uploadOnMulter.single("bannerImage"),
    createBanner
);

// PATCH Routes
router.patch(
    "/:bannerId",
    isAuthenticated,
    isAdmin,
    uploadOnMulter.single("bannerImage"),
    updateBanner
);

// DELETE Routes
router.delete("/:bannerId", isAuthenticated, isAdmin, deleteBanner);

export default router;
