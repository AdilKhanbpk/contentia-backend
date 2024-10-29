import express from "express";
import {
  createAdditionalService,
  getAdditionalServices,
  getAdditionalServiceById,
  updateAdditionalService,
  deleteAdditionalService,
} from "../../controllers/admin/adminAdditionalService.controller.js";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, createAdditionalService);
router.get("/", isAuthenticated, getAdditionalServices);
router.get("/:additionalServicesId", isAuthenticated, getAdditionalServiceById);
router.put("/:additionalServicesId", isAuthenticated, updateAdditionalService);
router.delete(
  "/:additionalServicesId",
  isAuthenticated,
  deleteAdditionalService
);

export default router;
