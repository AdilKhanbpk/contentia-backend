import express from "express";
import {
  isAuthenticated,
  isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
  createHelpSupport,
  deleteHelpSupport,
  getHelpSupportById,
  getHelpSupports,
  updateHelpSupport,
  updateHelpSupportIcon,
} from "../../controllers/admin/adminHelpSupport.controller.js";
import { uploadOnMulter } from "../../middlewares/multer.middleware.js";

const router = express.Router();

router.get("/", isAuthenticated, getHelpSupports);
router.get("/:helpSupportId", isAuthenticated, isAdmin, getHelpSupportById);
router.post(
  "/",
  isAuthenticated,
  isAdmin,
  uploadOnMulter.single("icon"),
  createHelpSupport
);
router.patch("/:helpSupportId", isAuthenticated, updateHelpSupport);
router.patch(
  "/:helpSupportId/change-icon",
  isAuthenticated,
  isAdmin,
  uploadOnMulter.single("icon"),
  updateHelpSupportIcon
);
router.delete("/:helpSupportId", isAuthenticated, isAdmin, deleteHelpSupport);

export default router;
