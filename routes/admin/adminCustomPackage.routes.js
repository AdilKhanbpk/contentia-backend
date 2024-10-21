import express from "express";
import { protect } from "../../controllers/auth.controller.js";
import {
  createCustomPackage,
  deleteCustomPackage,
  getAllCustomPackages,
  getCustomPackageById,
  updateCustomPackage,
} from "../../controllers/admin/adminCustomPackage.controller.js";

const router = express.Router();

// Protect all routes
router.use(protect);

router.post("/custom-packages", createCustomPackage);
router.get("/custom-packages", getAllCustomPackages);
router.get("/custom-packages/:id", getCustomPackageById);
router.put("/custom-packages/:id", updateCustomPackage);
router.delete("/custom-packages/:id", deleteCustomPackage);

export default router;
