import express from "express";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
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

router.post("/", isAuthenticated, createCustomPackage);
router.get("/", isAuthenticated, getAllCustomPackages);
router.get("/:packageId", isAuthenticated, getCustomPackageById);
router.patch("/:packageId", isAuthenticated, updateCustomPackage);
router.delete("/:packageId", isAuthenticated, deleteCustomPackage);

export default router;
