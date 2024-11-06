import express from "express";
import {
  isAuthenticated,
  isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
  createCustomPackage,
  deleteCustomPackage,
  getAllCustomPackages,
  getCustomPackageById,
  updateCustomPackage,
} from "../../controllers/admin/adminCustomPackage.controller.js";

const router = express.Router();

// Protect all routes
router.use(isAuthenticated);

router.post("/", isAuthenticated, isAdmin, createCustomPackage);
router.get("/", isAuthenticated, isAdmin, getAllCustomPackages);
router.get("/:packageId", isAuthenticated, isAdmin, getCustomPackageById);
router.patch("/:packageId", isAuthenticated, isAdmin, updateCustomPackage);
router.delete("/:packageId", isAuthenticated, isAdmin, deleteCustomPackage);

export default router;
