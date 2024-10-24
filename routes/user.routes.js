import express from "express";
import {
  changePassword,
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
router.patch("/", isAuthenticated, updateUser);
router.patch("/change-password", isAuthenticated, changePassword);

export default router;
