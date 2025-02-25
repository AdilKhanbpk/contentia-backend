import express from "express";

import { isAuthenticated } from "../middlewares/authentication.middleware.js";
import {
    changeBrandPic,
    createBrand,
    deleteBrand,
    getBrands,
    getMyBrands,
    getSingleBrand,
    updateBrand,
} from "../controllers/brand.controller.js";
import { uploadOnMulter } from "../middlewares/multer.middleware.js";

const router = express.Router();

// GET Routes
router.get("/", isAuthenticated, getBrands);
router.get("/my-brands", isAuthenticated, getMyBrands);
router.get("/:brandId", isAuthenticated, getSingleBrand);

// POST Routes
router.post(
    "/",
    isAuthenticated,
    uploadOnMulter.single("brandImage"),
    createBrand
);

// PATCH Routes
router.patch(
    "/:brandId",
    isAuthenticated,
    uploadOnMulter.single("brandImage"),
    updateBrand
);
router.patch(
    "/change-brand-image/:brandId",
    isAuthenticated,
    uploadOnMulter.single("brandImage"),
    changeBrandPic
);

// DELETE Routes
router.delete("/:brandId", isAuthenticated, deleteBrand);

export default router;
