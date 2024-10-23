import express from "express";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import {
  createEmailNotification,
  deleteEmailNotification,
  getEmailNotificationById,
  getEmailNotifications,
  updateEmailNotification,
} from "../../controllers/admin/adminEmailNotification.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getEmailNotifications);
router.get("/:emailNotificationId", isAuthenticated, getEmailNotificationById);
router.post("/", isAuthenticated, createEmailNotification);
router.patch("/:emailNotificationId", isAuthenticated, updateEmailNotification);
router.delete(
  "/:emailNotificationId",
  isAuthenticated,
  deleteEmailNotification
);

export default router;
