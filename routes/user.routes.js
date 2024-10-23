import express from "express";
import {
  login,
  logout,
  signup,
  updateUser,
} from "../controllers/user.controller.js";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", isAuthenticated, logout);
router.patch("/:userId", isAuthenticated, updateUser);

export default router;
