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

router.post("/", isAuthenticated, createCreator);
router.get("/", isAuthenticated, getAllCreators);
router.get("/:creatorId", isAuthenticated, getSingleCreator);
router.patch("/:creatorId", isAuthenticated, updateCreator);
router.delete("/:creatorId", isAuthenticated, deleteCreator);

export default router;
