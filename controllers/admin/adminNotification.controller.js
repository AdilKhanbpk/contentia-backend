import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import Creator from "../../models/creator.model.js";
import User from "../../models/user.model.js";
import Notification from "../../models/admin/adminNotification.model.js";
import { connectedSocket } from "../../socket/socket.js";
import { io } from "../../app.js";
import { notificationTemplates } from "../../helpers/notificationTemplates.js";

const sendNotification = async ({
    userType,
    title,
    details,
    users,
    eventType,
    metadata,
}) => {
    try {
        const userIds = await getUserIdsByType(userType, users);

        const userRefPath =
            userType === "creator"
                ? "Creator"
                : userType === "customer"
                    ? "User"
                    : null;

        const notification = await Notification.create({
            userType,
            title,
            details,
            users: userIds,
            eventType,
            metadata,
            userRefPath,
        });

        userIds.forEach((userId) => {
            const socketId = connectedSocket.get(userId);
            if (socketId) {
                io.to(socketId).emit("newNotification", notification);
            }
        });

        return notification;
    } catch (error) {
        throw new ApiError(
            500,
            `Failed to send notification: ${error.message}`
        );
    }
};

const getUserIdsByType = async (userType, users = []) => {
    const getModel = (type) =>
        type === "creator" || type === "some-creators" ? Creator : User;

    switch (userType) {
        case "some-creators":
        case "some-customers": {
            const model = getModel(userType);
            const usersFromDB = await model.find({ _id: { $in: users } });
            const foundIds = usersFromDB.map((user) => user._id.toString());
            const missingIds = users.filter((id) => !foundIds.includes(id));

            if (missingIds.length > 0) {
                throw new ApiError(
                    404,
                    `The following ${userType} IDs were not found: ${missingIds.join(", ")}`
                );
            }

            return foundIds;
        }

        case "creator": {
            const creators = await Creator.find();
            return creators.map((user) => user._id.toString());
        }

        case "customer": {
            const customers = await User.find();
            return customers.map((user) => user._id.toString());
        }

        case "all": {
            const creators = await Creator.find();
            const customers = await User.find();
            return [
                ...creators.map((user) => user._id.toString()),
                ...customers.map((user) => user._id.toString()),
            ];
        }

        default:
            throw new ApiError(400, "Invalid user type provided");
    }
};

const createNotification = asyncHandler(async (req, res) => {
    const { userType, title, details, users } = req.body;

    if (!userType || !title || !details) {
        throw new ApiError(400, "Please provide all the required fields");
    }

    const userIds = await getUserIdsByType(userType, users);

    const notificationData = notificationTemplates.generalNotification({
        adminName: req.user.fullName || "Admin",
        title,
        details,
        userType,
        targetUsers: userIds,
        metadata: {
            message: "This is a general notification from admin",
            author: req.user.fullName,
            author_role: req.user.role,
        },
    });

    const createdNotification = await sendNotification(notificationData);

    if (!createdNotification) {
        throw new ApiError(500, "Failed to create notification");
    }

    res.status(201).json(
        new ApiResponse(201, createdNotification, "Notification created successfully")
    );
});

const getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find();

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

    const notification = await Notification.findById(notificationId);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                notification,
                "Notification retrieved successfully"
            )
        );
});

const getMyNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const notifications = await Notification.find({ users: userId });

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

const updateNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const { title, details } = req.body;

    isValidId(notificationId);

    const updatedNotification = await Notification.findByIdAndUpdate(
        notificationId,
        { title, details },
        { new: true }
    );

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

    const deletedNotification = await Notification.findByIdAndDelete(
        notificationId
    );

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

const markNotificationAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const userId = req.user._id;

    isValidId(notificationId);

    const notification = await Notification.findById(notificationId);

    if (!notification) {
        throw new ApiError(404, "Notification not found");
    }

    if (notification.readBy.includes(userId)) {
        return res.status(200).json(
            new ApiResponse(200, notification, "Notification is already marked as read")
        );
    }

    notification.readBy.push(userId);

    const updatedNotification = await notification.save();

    return res.status(200).json(
        new ApiResponse(200, updatedNotification, "Notification marked as read successfully")
    );
});

const getUnreadNotifications = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const unreadNotifications = await Notification.find({
        users: userId,
        readBy: { $nin: [userId] }
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            unreadNotifications,
            "Unread notifications retrieved successfully"
        )
    );
});

const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const notifications = await Notification.find({ users: userId });

    for (const notification of notifications) {
        if (!notification.readBy.includes(userId)) {
            notification.readBy.push(userId);
            await notification.save();
        }
    }

    return res.status(200).json(
        new ApiResponse(200, notifications, "All notifications marked as read successfully")
    );
});




export {
    createNotification,
    sendNotification,
    getNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
    getMyNotifications,
    markNotificationAsRead,
    getUnreadNotifications,
    markAllNotificationsAsRead,
};
