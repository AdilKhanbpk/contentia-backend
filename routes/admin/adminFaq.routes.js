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
router.get("/:faqId", isAuthenticated, getFaqs); // Consider updating to getFaqById
router.post("/", isAuthenticated, createFaq);
router.patch("/:faqId", isAuthenticated, updateFaq);
router.delete("/:faqId", isAuthenticated, deleteFaq);

export default router;
