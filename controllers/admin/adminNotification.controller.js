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
    console.log("🚀 ~ users:", users);

    try {
        const userRefPath =
            userType === "creator"
                ? "Creator"
                : userType === "customer"
                ? "User"
                : null;

        if (!userRefPath && userType !== "all") {
            throw new ApiError(400, "Invalid user type provided");
        }

        const notification = await Notification.create({
            userType,
            title,
            details,
            users,
            eventType,
            metadata,
            userRefPath: userType === "all" ? null : userRefPath,
        });

        users.forEach((userId) => {
            const socketId = connectedSocket.get(userId.toString());
            console.log("Sending Notification to  Socket ID:", socketId);
            if (socketId) {
                io.to(socketId).emit("newNotification", notification);
                console.log("Notification sent to Socket ID:", socketId);
            } else {
                console.log(`User ${userId} is not connected.`);
            }
        });

        return notification;
    } catch (error) {
        throw new ApiError(
            500,
            `Failed to send notification : ${error.message}`
        );
    }
};

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
                `The following ${userType} IDs were not found: ${missingIds.join(
                    ", "
                )}`
            );
        }
    };

    if (userType === "creator" || userType === "customer") {
        const model = userType === "creator" ? Creator : User;
        const usersFromDB = await model.find({ _id: { $in: users } });
        checkMissingIds(users, usersFromDB, userType);
        userIds = usersFromDB.map((user) => user._id);
    } else if (userType === "all") {
        const creators = await Creator.find();
        const customers = await User.find();
        userIds = [
            ...creators.map((creator) => creator._id),
            ...customers.map((customer) => customer._id),
        ];
    } else {
        throw new ApiError(400, "Invalid user type provided");
    }

    const notificationData = notificationTemplates.generalNotification({
        title,
        details,
        userType,
        users: userIds,
        metadata: {
            message: "This is a general notification",
            author: req.user.fullName,
            author_role: req.user.role,
        },
    });

    const createdNotification = await sendNotification(notificationData);

    if (!createdNotification) {
        throw new ApiError(500, "Failed to create notification");
    }

    userIds.map((userId) => {
        const socketId = connectedSocket.get(userId.toString());
        if (socketId) {
            io.to(socketId).emit("newNotification", createdNotification);
        } else {
            console.log(`User ${userId} is not connected.`);
        }
    });

    res.status(201).json(
        new ApiResponse(
            201,
            createdNotification,
            "Notification created successfully"
        )
    );
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
    sendNotification,
    getNotifications,
    getNotificationById,
    updateNotification,
    deleteNotification,
    getMyNotifications,
};
