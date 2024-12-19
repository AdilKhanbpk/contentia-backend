import express from "express";

import { isAuthenticated } from "../middlewares/authentication.middleware.js";
import {
    createBrand,
    deleteBrand,
    getBrands,
    getSingleBrand,
    updateBrand,
} from "../controllers/brand.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, createBrand);
router.get("/", isAuthenticated, getBrands);
router.get("/:brandId", isAuthenticated, getSingleBrand);
router.patch("/:brandId", isAuthenticated, updateBrand);
router.delete("/:brandId", isAuthenticated, deleteBrand);
router.patch(
    "/change-brand-image/:brandId",
    isAuthenticated,
    uploadOnMulter.single("brandImage"),
    updateBrand
);

export default router;
