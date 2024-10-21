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

router.post("/", createAdditionalService);
router.get("/", getAdditionalServices);
router.get("/:id", getAdditionalServiceById);
router.put("/:id", updateAdditionalService);
router.delete("/:id", deleteAdditionalService);

export default router;
