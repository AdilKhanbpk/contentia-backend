const express = require("express");
const { protect } = require("../../controllers/auth.controller");
const router = express.Router();

router.get("/", protect, CustomPackageController.getBanner);
router.post("/", protect, CustomPackageController.createBanner);
router.put("/:id", protect, CustomPackageController.updateBanner);
router.delete("/:id", protect, CustomPackageController.deleteBanner);
router.get("/:id", protect, CustomPackageController.getBannerById);

module.exports = router;
