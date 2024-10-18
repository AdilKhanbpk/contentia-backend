const express = require("express");
const { protect } = require("../../controllers/auth.controller");
const HowItWorksController = require("../../controllers/admin/adminHowItWorks.controller");

const router = express.Router();

router.get("/", protect, HowItWorksController.getHowItWorks);
router.get("/:id", protect, HowItWorksController.getHowItWorksById);
router.post("/", protect, HowItWorksController.createHowItWorks);
router.put("/:id", protect, HowItWorksController.updateHowItWorks);
router.delete("/:id", protect, HowItWorksController.deleteHowItWorks);

module.exports = router;
