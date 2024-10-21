import express from "express";
import { login, logout, signup } from "../controllers/auth.controller.js";

const router = express.Router();

// Route for signup
router.get("/signup", (req, res) => {
  res.status(200).json({
    message: "Signup endpoint",
    title: "Sign Up",
  });
});

// Route for login
router.get("/login", (req, res) => {
  res.status(200).json({
    message: "Login endpoint",
    title: "Log into your account",
  });
});

// Route for handling signup form submission
router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

export default router;
