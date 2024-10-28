import express from "express";
import {
  createAbout,
  getAbout,
} from "../../controllers/admin/adminAbout.controller.js";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";

const router = express.Router();

router.get("/", getAbout);
router.post("/", createAbout);

export default router;
