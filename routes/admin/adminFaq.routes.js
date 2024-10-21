import express from "express";
import { protect } from "../../controllers/auth.controller.js";
import {
  createFaq,
  deleteFaq,
  getFaqs,
  updateFaq,
} from "../../controllers/admin/adminFaq.controller.js";

const router = express.Router();

router.get("/", protect, getFaqs);
router.get("/:id", protect, getFaqs); // Consider updating to getFaqById
router.post("/", protect, createFaq);
router.put("/:id", protect, updateFaq);
router.delete("/:id", protect, deleteFaq);

export default router;
