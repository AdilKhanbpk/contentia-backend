import express from "express";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import {
  createFaq,
  deleteFaq,
  getFaqs,
  updateFaq,
} from "../../controllers/admin/adminFaq.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getFaqs);
router.get("/:id", isAuthenticated, getFaqs); // Consider updating to getFaqById
router.post("/", isAuthenticated, createFaq);
router.put("/:id", isAuthenticated, updateFaq);
router.delete("/:id", isAuthenticated, deleteFaq);

export default router;
