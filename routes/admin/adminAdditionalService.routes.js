const express = require("express");
const {
  createAdditionalService,
  getAdditionalServices,
  getAdditionalServiceById,
  updateAdditionalService,
  deleteAdditionalService,
} = require("../../controllers/admin/adminAdditionalService.controller");

const router = express.Router();

router.post("/", createAdditionalService);
router.get("/", getAdditionalServices);
router.get("/:id", getAdditionalServiceById);
router.put("/:id", updateAdditionalService);
router.delete("/:id", deleteAdditionalService);

module.exports = router;
