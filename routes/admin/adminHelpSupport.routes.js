const express = require("express");
const { protect } = require("../../controllers/auth.controller");
const HelpSupportController = require("../../controllers/admin/adminHelpSupport.controller");

const router = express.Router();

router.get("/", protect, HelpSupportController.getHelpSupports);
router.get("/:id", protect, HelpSupportController.getHelpSupport);
router.post("/", protect, HelpSupportController.createHelpSupport);
router.put("/:id", protect, HelpSupportController.updateHelpSupport);
router.delete("/:id", protect, HelpSupportController.deleteHelpSupport);

module.exports = router;
