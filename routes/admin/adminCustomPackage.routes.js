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

router.post("/", createCustomPackage);
router.get("/", getAllCustomPackages);
router.get("/:packageId", getCustomPackageById);
router.patch("/:packageId", updateCustomPackage);
router.delete("/:packageId", deleteCustomPackage);

export default router;
