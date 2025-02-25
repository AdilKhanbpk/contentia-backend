import express from "express";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
    createLandingPage,
    getLandingPage,
    updateLandingPage,
} from "../../controllers/admin/adminLandingPage.controller.js";
import { uploadOnMulter } from "../../middlewares/multer.middleware.js";

const router = express.Router();

const videoUploadFields = uploadOnMulter.fields(
    Array.from({ length: 10 }, (_, i) => ({ name: `video${i + 1}`, maxCount: 1 }))
);

// Routes
router.post("/", isAuthenticated, isAdmin, videoUploadFields, createLandingPage);
router.get("/", getLandingPage);
router.patch("/:landingPageId", isAuthenticated, isAdmin, videoUploadFields, updateLandingPage);

export default router;
