const express = require("express");
const BannerController = require("../../controllers/admin/adminBanner.controller");
const { protect } = require("../../controllers/auth.controller");
const router = express.Router();

router.get("/", protect, BannerController.getBanners);
router.post("/", protect, BannerController.createBanner);
router.put("/:id", protect, BannerController.updateBanner);
router.delete("/:id", protect, BannerController.deleteBanner);
router.get("/:id", protect, BannerController.getBannerById);

module.exports = router;
