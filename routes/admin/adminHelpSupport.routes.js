import express from "express";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import {
  createHelpSupport,
  deleteHelpSupport,
  getHelpSupportById,
  getHelpSupports,
  updateHelpSupport,
} from "../../controllers/admin/adminHelpSupport.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getHelpSupports);
router.get("/:id", isAuthenticated, getHelpSupportById);
router.post("/", isAuthenticated, createHelpSupport);
router.put("/:id", isAuthenticated, updateHelpSupport);
router.delete("/:id", isAuthenticated, deleteHelpSupport);

export default router;
