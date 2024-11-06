import express from "express";

import {
  isAuthenticated,
  isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
  createNotification,
  deleteNotification,
  getNotificationById,
  getNotifications,
  updateNotification,
} from "../../controllers/admin/adminNotification.controller.js";

const router = express.Router();

router.get("", isAuthenticated, getNotifications);
router.post("/", isAuthenticated, isAdmin, createNotification);
router.patch("/:notificationId", isAuthenticated, isAdmin, updateNotification);
router.delete("/:notificationId", isAuthenticated, isAdmin, deleteNotification);
router.get("/:notificationId", isAuthenticated, isAdmin, getNotificationById);

export default router;
