import express from "express";
import {
  isAuthenticated,
  isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
  createHowItWorks,
  deleteHowItWorks,
  getHowItWorks,
  getHowItWorksById,
  updateStepInHowItWorks,
} from "../../controllers/admin/adminHowItWorks.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getHowItWorks);
router.get("/:howItWorksId", isAuthenticated, isAdmin, getHowItWorksById);
router.post("/", isAuthenticated, isAdmin, createHowItWorks);
router.patch(
  "/:howItWorksId",
  isAuthenticated,
  isAdmin,
  updateStepInHowItWorks
);
router.delete("/:howItWorksId", isAuthenticated, isAdmin, deleteHowItWorks);

export default router;
