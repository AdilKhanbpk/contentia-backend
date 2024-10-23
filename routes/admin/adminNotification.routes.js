import express from "express";

import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import {
  createNotification,
  deleteNotification,
  getNotificationById,
  getNotifications,
  updateNotification,
} from "../../controllers/admin/adminNotification.controller.js";

const router = express.Router();

router.get("", isAuthenticated, getNotifications);
router.post("/", isAuthenticated, createNotification);
router.patch("/:notificationId", isAuthenticated, updateNotification);
router.delete("/:notificationId", isAuthenticated, deleteNotification);
router.get("/:notificationId", isAuthenticated, getNotificationById);

export default router;
