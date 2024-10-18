const express = require("express");
const { protect } = require("../../controllers/auth.controller");
const FaqController = require("../../controllers/admin/adminFaq.controller");

const router = express.Router();

router.get("/", protect, FaqController.getFaqs);
router.get("/:id", protect, FaqController.getFaq);
router.post("/", protect, FaqController.createFaq);
router.put("/:id", protect, FaqController.updateFaq);
router.delete("/:id", protect, FaqController.deleteFaq);

module.exports = router;
