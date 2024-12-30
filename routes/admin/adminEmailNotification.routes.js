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

router.get("/", isAuthenticated, isAdmin, getEmailNotifications);
router.get(
    "/:emailNotificationId",
    isAuthenticated,
    isAdmin,
    getEmailNotificationById
);
router.post("/", isAuthenticated, isAdmin, createEmailNotification);
router.patch(
    "/:emailNotificationId",
    isAuthenticated,
    isAdmin,
    updateEmailNotification
);
router.delete(
    "/:emailNotificationId",
    isAuthenticated,
    isAdmin,
    deleteEmailNotification
);

export default router;
