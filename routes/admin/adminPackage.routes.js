import express from "express";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
    createLandingPagePackage,
    deleteLandingPagePackage,
    getAllLandingPagePackages,
    getLandingPagePackageById,
    updateLandingPagePackage,
} from "../../controllers/admin/adminPackage.controller.js";

const router = express.Router();

// GET Requests
router.get("/", getAllLandingPagePackages);
router.get("/:packageId", isAuthenticated, getLandingPagePackageById);

// POST Requests
router.post("/", isAuthenticated, isAdmin, createLandingPagePackage);

// PATCH Requests
router.patch("/:packageId", isAuthenticated, isAdmin, updateLandingPagePackage);

// DELETE Requests
router.delete("/:packageId", isAuthenticated, isAdmin, deleteLandingPagePackage);

export default router;
