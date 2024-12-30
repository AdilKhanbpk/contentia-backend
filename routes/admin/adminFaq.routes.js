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
} from "../../controllers/admin/adminFaq.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getFaqs);
router.get("/:faqId", isAuthenticated, isAdmin, getFaqs); // Consider updating to getFaqById
router.post("/", isAuthenticated, isAdmin, createFaq);
router.patch("/:faqId", isAuthenticated, isAdmin, updateFaq);
router.delete("/:faqId", isAuthenticated, isAdmin, deleteFaq);

export default router;
