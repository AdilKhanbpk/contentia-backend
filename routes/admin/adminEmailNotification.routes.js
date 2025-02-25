import express from "express";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
    createEmailNotification,
    deleteEmailNotification,
    getEmailNotificationById,
    getEmailNotifications,
    updateEmailNotification,
} from "../../controllers/admin/adminEmailNotification.controller.js";

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(isAuthenticated, isAdmin);

// GET Routes
router.get("/", getEmailNotifications);
router.get("/:emailNotificationId", getEmailNotificationById);

// POST Routes
router.post("/", createEmailNotification);

// PATCH Routes
router.patch("/:emailNotificationId", updateEmailNotification);

// DELETE Routes
router.delete("/:emailNotificationId", deleteEmailNotification);

export default router;
