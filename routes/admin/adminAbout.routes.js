const express = require("express");
const router = express.Router();
const adminAboutController = require("../../controllers/admin/adminAbout.controller");

router.get("/", adminAboutController.getAbout);
router.post("/", adminAboutController.createOrUpdateAbout);

module.exports = router;
