import express from "express";
import {
    createAbout,
    deleteAbout,
    getAbout,
    updateAbout,
    updateAboutImage,
} from "../../controllers/admin/adminAbout.controller.js";
import {
    isAdmin,
    isAuthenticated,
} from "../../middlewares/authentication.middleware.js";
import { uploadOnMulter } from "../../middlewares/multer.middleware.js";

const router = express.Router();

// GET Routes
router.get("/", getAbout);

// POST Routes
router.post(
    "/",
    isAuthenticated,
    isAdmin,
    uploadOnMulter.single("aboutImage"),
    createAbout
);

// PATCH Routes
router.patch("/:aboutId", isAuthenticated, isAdmin, updateAbout);
router.patch(
    "/:aboutId/change-image",
    isAuthenticated,
    isAdmin,
    uploadOnMulter.single("aboutImage"),
    updateAboutImage
);

// DELETE Routes
router.delete("/:aboutId", isAuthenticated, isAdmin, deleteAbout);

export default router;
