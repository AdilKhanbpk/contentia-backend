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

// Protect all routes
router.use(isAuthenticated);

router.post("/", isAuthenticated, isAdmin, createLandingPagePackage);
router.get("/", isAuthenticated, isAdmin, getAllLandingPagePackages);
router.get("/:packageId", isAuthenticated, getLandingPagePackageById);
router.patch("/:packageId", isAuthenticated, isAdmin, updateLandingPagePackage);
router.delete(
    "/:packageId",
    isAuthenticated,
    isAdmin,
    deleteLandingPagePackage
);

export default router;
