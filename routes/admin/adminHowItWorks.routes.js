import express from "express";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import {
  createHowItWorks,
  deleteHowItWorks,
  getHowItWorks,
  getHowItWorksById,
  updateStepInHowItWorks,
} from "../../controllers/admin/adminHowItWorks.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getHowItWorks);
router.get("/:howItWorksId", isAuthenticated, getHowItWorksById);
router.post("/", isAuthenticated, createHowItWorks);
router.patch("/:howItWorksId", isAuthenticated, updateStepInHowItWorks);
router.delete("/:howItWorksId", isAuthenticated, deleteHowItWorks);

export default router;
