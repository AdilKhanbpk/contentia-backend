import express from "express";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import {
  createHowItWorks,
  deleteHowItWorks,
  getHowItWorks,
  getHowItWorksById,
  updateHowItWorks,
} from "../../controllers/admin/adminHowItWorks.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getHowItWorks);
router.get("/:id", isAuthenticated, getHowItWorksById);
router.post("/", isAuthenticated, createHowItWorks);
router.put("/:id", isAuthenticated, updateHowItWorks);
router.delete("/:id", isAuthenticated, deleteHowItWorks);

export default router;
