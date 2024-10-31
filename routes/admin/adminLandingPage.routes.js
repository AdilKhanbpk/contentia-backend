import express from "express";

import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import {
  createLandingPage,
  getLandingPage,
  updateLandingPage,
} from "../../controllers/admin/adminLandingPage.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, createLandingPage);
router.get("/", isAuthenticated, getLandingPage);
router.patch("/:landingPageId", isAuthenticated, updateLandingPage);

export default router;
