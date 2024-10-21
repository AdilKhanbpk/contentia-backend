import express from "express";
import {
  createOrUpdateAbout,
  getAbout,
} from "../../controllers/admin/adminAbout.controller.js";

const router = express.Router();

router.get("/", getAbout);
router.post("/", createOrUpdateAbout);

export default router;
