import express from "express";
import {
  changePassword,
  createCreator,
  loginCreator,
  updateCreator,
} from "../controllers/creator.controller.js";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";

const router = express.Router();

// Route to create or update OrdersProfile
router.post("/create", createCreator);
router.post("/login", loginCreator);
router.patch("/:creatorId", isAuthenticated, updateCreator);
router.patch("/:creatorId/change-password", isAuthenticated, changePassword);

export default router;
