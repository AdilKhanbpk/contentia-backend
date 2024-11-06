import express from "express";

import {
  isAuthenticated,
  isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
  createLandingPage,
  getLandingPage,
  updateLandingPage,
} from "../../controllers/admin/adminLandingPage.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, isAdmin, createLandingPage);
router.get("/", isAuthenticated, getLandingPage);
router.patch("/:landingPageId", isAuthenticated, isAdmin, updateLandingPage);

export default router;
