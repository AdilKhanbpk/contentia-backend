const express = require("express");
const { protect } = require("../../controllers/auth.controller");
const CustomPackageController = require("../../controllers/admin/adminCustomPackage.controller");

const router = express.Router();

// Protect all routes
router.use(protect);

router.post("/custom-packages", CustomPackageController.createCustomPackage);
router.get("/custom-packages", CustomPackageController.getAllCustomPackages);
router.get(
  "/custom-packages/:id",
  CustomPackageController.getCustomPackageById
);
router.put("/custom-packages/:id", CustomPackageController.updateCustomPackage);
router.delete(
  "/custom-packages/:id",
  CustomPackageController.deleteCustomPackage
);

module.exports = router;
