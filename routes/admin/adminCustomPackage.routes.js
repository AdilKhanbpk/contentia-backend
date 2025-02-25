import express from "express";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
    createCustomPackage,
    deleteCustomPackage,
    getAllCustomPackages,
    getAllCustomPackagesByCustomer,
    getCustomPackageById,
    updateCustomPackage,
} from "../../controllers/admin/adminCustomPackage.controller.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// GET Routes
router.get("/", isAdmin, getAllCustomPackages);
router.get("/:packageId", isAdmin, getCustomPackageById);
router.get("/my-packages", getAllCustomPackagesByCustomer);

// POST Routes
router.post("/", isAdmin, createCustomPackage);

// PATCH Routes
router.patch("/:packageId", isAdmin, updateCustomPackage);

// DELETE Routes
router.delete("/:packageId", isAdmin, deleteCustomPackage);

export default router;
