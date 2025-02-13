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

router.post(
    "/",
    isAuthenticated,
    uploadOnMulter.single("brandImage"),
    createBrand
);
router.get("/", isAuthenticated, getBrands);
router.get("/my-brands", isAuthenticated, getMyBrands);
router.get("/:brandId", isAuthenticated, getSingleBrand);
router.patch(
    "/:brandId",
    isAuthenticated,
    uploadOnMulter.single("brandImage"),
    updateBrand
);
router.delete("/:brandId", isAuthenticated, deleteBrand);
router.patch(
    "/change-brand-image/:brandId",
    isAuthenticated,
    uploadOnMulter.single("brandImage"),
    changeBrandPic
);

export default router;
