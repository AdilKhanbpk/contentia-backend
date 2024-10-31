import express from "express";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
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
router.get("/:helpSupportId", isAuthenticated, getHelpSupportById);
router.post(
  "/",
  isAuthenticated,
  uploadOnMulter.single("icon"),
  createHelpSupport
);
router.patch("/:helpSupportId", isAuthenticated, updateHelpSupport);
router.patch(
  "/:helpSupportId/change-icon",
  isAuthenticated,
  uploadOnMulter.single("icon"),
  updateHelpSupportIcon
);
router.delete("/:helpSupportId", isAuthenticated, deleteHelpSupport);

export default router;
