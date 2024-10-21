import express from "express";
import { protect } from "../../controllers/auth.controller.js";
import {
  createHelpSupport,
  deleteHelpSupport,
  getHelpSupportById,
  getHelpSupports,
  updateHelpSupport,
} from "../../controllers/admin/adminHelpSupport.controller.js";

const router = express.Router();

router.get("/", protect, getHelpSupports);
router.get("/:id", protect, getHelpSupportById);
router.post("/", protect, createHelpSupport);
router.put("/:id", protect, updateHelpSupport);
router.delete("/:id", protect, deleteHelpSupport);

export default router;
