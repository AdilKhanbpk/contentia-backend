import express from "express";
import {
  changePassword,
  getProfile,
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
router.patch("/update-me", isAuthenticated, updateUser);
router.patch("/change-password", isAuthenticated, changePassword);
router.get("/me", isAuthenticated, getProfile);

export default router;
