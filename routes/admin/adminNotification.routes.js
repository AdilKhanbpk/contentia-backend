import express from "express";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
    createNotification,
    deleteNotification,
    getMyNotifications,
    getNotificationById,
    getNotifications,
    getUnreadNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    updateNotification,
} from "../../controllers/admin/adminNotification.controller.js";

const router = express.Router();

// Public/User-Specific Routes
router.get("/my-notifications", isAuthenticated, getMyNotifications);
router.get("/my-unread-notifications", isAuthenticated, isAdmin, getUnreadNotifications);
router.patch("/mark-all-as-read", isAuthenticated, isAdmin, markAllNotificationsAsRead);

// Admin Routes
router.get("/", isAuthenticated, getNotifications);
router.post("/", isAuthenticated, isAdmin, createNotification);

// Admin Routes for Specific Notification
router.get("/:notificationId", isAuthenticated, isAdmin, getNotificationById);
router.patch("/is-marked-read/:notificationId", isAuthenticated, isAdmin, markNotificationAsRead);
router.patch("/:notificationId", isAuthenticated, isAdmin, updateNotification);
router.delete("/:notificationId", isAuthenticated, isAdmin, deleteNotification);

export default router;
