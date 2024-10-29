import express from "express";
import {
  createAbout,
  deleteAbout,
  getAbout,
  updateAbout,
  updateAboutImage,
} from "../../controllers/admin/adminAbout.controller.js";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import { uploadOnMulter } from "../../middlewares/multer.middleware.js";

const router = express.Router();

router.get("/:aboutId", isAuthenticated, getAbout);
router.patch("/:aboutId", isAuthenticated, updateAbout);
router.patch(
  "/:aboutId/change-image",
  isAuthenticated,
  uploadOnMulter.single("aboutImage"),
  updateAboutImage
);
router.post(
  "/",
  uploadOnMulter.single("aboutImage"),
  isAuthenticated,
  createAbout
);
router.delete("/:aboutId", isAuthenticated, deleteAbout);

export default router;
