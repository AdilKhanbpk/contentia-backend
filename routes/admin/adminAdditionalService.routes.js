import express from "express";
import {
  createAdditionalService,
  getAdditionalServices,
  getAdditionalServiceById,
  updateAdditionalService,
  deleteAdditionalService,
} from "../../controllers/admin/adminAdditionalService.controller.js";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import { uploadOnMulter } from "../../middlewares/multer.middleware.js";

const router = express.Router();

router.post(
  "/",
  isAuthenticated,
  uploadOnMulter.single("image"),
  createAdditionalService
);
router.get("/", isAuthenticated, getAdditionalServices);
router.get("/:additionalServicesId", isAuthenticated, getAdditionalServiceById);
router.patch(
  "/:additionalServicesId",
  isAuthenticated,
  uploadOnMulter.single("image"),
  updateAdditionalService
);
router.delete(
  "/:additionalServicesId",
  isAuthenticated,
  deleteAdditionalService
);

export default router;
