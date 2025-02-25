import express from "express";
import {
    createAdditionalService,
    getAdditionalServices,
    getAdditionalServiceById,
    updateAdditionalService,
    deleteAdditionalService,
} from "../../controllers/admin/adminAdditionalService.controller.js";
import {
    isAdmin,
    isAuthenticated,
} from "../../middlewares/authentication.middleware.js";
import { uploadOnMulter } from "../../middlewares/multer.middleware.js";

const router = express.Router();

// GET Routes
router.get("/", isAuthenticated, getAdditionalServices);
router.get("/:additionalServicesId", isAuthenticated, isAdmin, getAdditionalServiceById);

// POST Routes
router.post(
    "/",
    isAuthenticated,
    isAdmin,
    uploadOnMulter.single("image"),
    createAdditionalService
);

// PATCH Routes
router.patch(
    "/:additionalServicesId",
    isAuthenticated,
    isAdmin,
    uploadOnMulter.single("image"),
    updateAdditionalService
);

// DELETE Routes
router.delete("/:additionalServicesId", isAuthenticated, isAdmin, deleteAdditionalService);

export default router;
