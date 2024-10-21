import express from "express";
import { protect } from "../../controllers/auth.controller.js";
import {
  createHowItWorks,
  deleteHowItWorks,
  getHowItWorks,
  getHowItWorksById,
  updateHowItWorks,
} from "../../controllers/admin/adminHowItWorks.controller.js";

const router = express.Router();

router.get("/", protect, getHowItWorks);
router.get("/:id", protect, getHowItWorksById);
router.post("/", protect, createHowItWorks);
router.put("/:id", protect, updateHowItWorks);
router.delete("/:id", protect, deleteHowItWorks);

export default router;
