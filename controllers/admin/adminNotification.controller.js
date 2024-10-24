// controllers/adminClaimsController.js
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import {
  createADocument,
  deleteById,
  findAll,
  findById,
  updateById,
} from "../../utils/dbHelpers.js";
import Creator from "../../models/admin/adminCreatorUser.model.js";
import User from "../../models/user.model.js";
import Notification from "../../models/admin/adminNotification.model.js";

const createNotification = asyncHandler(async (req, res) => {
  const { userType, title, details, users } = req.body;

  if (!userType || !title || !details) {
    throw new ApiError(400, "Please provide all the required fields");
  }
  let userIds = [];

  const checkMissingIds = (providedIds, foundUsers, userType) => {
    const foundIds = foundUsers.map((user) => user._id.toString());
    const missingIds = providedIds.filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      throw new ApiError(
        404,
        `The following ${userType} IDs were not found: ${missingIds.join(", ")}`
      );
    }
  };

  if (userType === "creator") {
    const creators = await Creator.find({ _id: { $in: users } });
    checkMissingIds(users, creators, "creator");
    userIds = creators.map((creator) => creator._id);
  } else if (userType === "customer") {
    const customers = await User.find({ _id: { $in: users } });
    checkMissingIds(users, customers, "customer");
    userIds = customers.map((customer) => customer._id);
  } else {
    throw new ApiError(400, "Invalid user type provided");
  }

  const createdNotification = await createADocument(Notification, {
    userType,
    title,
    details,
    users: userIds,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, createdNotification, "Notification created"));
});

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await findAll(Notification);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        notifications,
        "Notifications retrieved successfully"
      )
    );
});

const getNotificationById = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  isValidId(notificationId);

  const notification = await findById(Notification, notificationId);

  return res
    .status(200)
    .json(
      new ApiResponse(200, notification, "Notification retrieved successfully")
    );
});

const updateNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;
  const { title, details } = req.body;

  isValidId(notificationId);

  const updatedNotification = await updateById(Notification, notificationId, {
    title,
    details,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedNotification,
        "Notification updated successfully"
      )
    );
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  isValidId(notificationId);

  const deletedNotification = await deleteById(Notification, notificationId);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        deletedNotification,
        "Notification deleted successfully"
      )
    );
});

export {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
};
