import express from "express";
import {
  createCreator,
  deleteCreator,
  getAllCreators,
  getSingleCreator,
  updateCreator,
} from "../../controllers/admin/adminCreator.controller.js";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";

const router = express.Router();

// Protect all routes
router.use(isAuthenticated);

router.post("/", createCreator);
router.get("/", getAllCreators);
router.get("/:creatorId", getSingleCreator);
router.patch("/:creatorId", updateCreator);
router.delete("/:creatorId", deleteCreator);

export default router;
