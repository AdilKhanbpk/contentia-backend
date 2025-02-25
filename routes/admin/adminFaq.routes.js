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
router.use(isAuthenticated);

// GET Routes
router.get("/", getFaqs);
router.get("/:faqId", isAdmin, getFaqById);

// POST Routes
router.post("/", isAdmin, createFaq);

// PATCH Routes
router.patch("/:faqId", isAdmin, updateFaq);

// DELETE Routes
router.delete("/:faqId", isAdmin, deleteFaq);

export default router;
