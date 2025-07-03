import express from "express";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
    createFaq,
    deleteFaq,
    getFaqs,
    updateFaq,
    getFaqById,
} from "../../controllers/admin/adminFaq.controller.js";

const router = express.Router();

// Apply authentication globally

// GET Routes
router.get("/", getFaqs);
router.get("/:faqId", isAuthenticated, isAdmin, getFaqById);

// POST Routes
router.post("/", isAuthenticated, isAdmin, createFaq);

// PATCH Routes
router.patch("/:faqId", isAuthenticated, isAdmin, updateFaq);

// DELETE Routes
router.delete("/:faqId", isAuthenticated, isAdmin, deleteFaq);

export default router;
