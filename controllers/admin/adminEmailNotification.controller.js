import EmailNotification from "../../models/admin/adminEmailNotification.model.js";
import Creator from "../../models/creator.model.js";
import User from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import sendEmail from "../../utils/email.js";

const fetchUsersByType = async (users, userType) => {
    let foundUsers = [];

    switch (userType) {
        case "all":
            const allUsers = await User.find({});
            const allCreators = await Creator.find({});
            foundUsers = [...allUsers, ...allCreators];
            break;
        case "all-creators":
            foundUsers = await Creator.find({});
            break;
        case "all-customers":
            foundUsers = await User.find({});
            break;
        case "some-creators":
            foundUsers = await Creator.find({ _id: { $in: users } });
            break;
        case "some-customers":
            foundUsers = await User.find({ _id: { $in: users } });
            break;
        default:
            throw new ApiError(400, "Invalid user type provided");
    }

    if (userType === "some-creators" || userType === "some-customers") {
        const foundIds = foundUsers.map((user) => user._id.toString());
        const missingIds = users.filter((id) => !foundIds.includes(id));

        if (missingIds.length > 0) {
            throw new ApiError(
                404,
                `The following ${userType} IDs were not found: ${missingIds.join(
                    ", "
                )}`
            );
        }
    }

    const userIds = foundUsers.map((user) => user._id);
    const emailAddresses = foundUsers.map((user) => user.email);

    return { userIds, emailAddresses, foundUsersCount: foundUsers.length };
};

const createEmailNotification = asyncHandler(async (req, res) => {
    const { emailTitle, emailContent, users, userType } = req.body;

    if (!emailTitle || !emailContent || !userType) {
        throw new ApiError(400, "Please provide all the required fields");
    }

    const { userIds, emailAddresses, foundUsersCount } = await fetchUsersByType(
        users,
        userType
    );

    const newEmailNotification = await EmailNotification.create({
        userType,
        emailTitle,
        emailContent,
        users: userIds,
    });

    await sendEmail({
        email: emailAddresses,
        subject: emailTitle,
        html: emailContent,
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                newEmailNotification,
                "Email Notification created and sent successfully"
            )
        );
});

const getEmailNotifications = asyncHandler(async (req, res) => {
    const emailNotifications = await EmailNotification.find({});

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                emailNotifications,
                "Email Notifications retrieved successfully"
            )
        );
});

const getEmailNotificationById = asyncHandler(async (req, res) => {
    const { emailNotificationId } = req.params;
    isValidId(emailNotificationId);

    const emailNotification = await EmailNotification.findById(
        emailNotificationId
    );

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                emailNotification,
                "Email Notification retrieved successfully"
            )
        );
});

const updateEmailNotification = asyncHandler(async (req, res) => {
    const { emailNotificationId } = req.params;
    const { emailTitle, emailContent, users, userType } = req.body;

    isValidId(emailNotificationId);

    if (!emailTitle || !emailContent || !userType) {
        throw new ApiError(400, "Please provide all the required fields");
    }

    const { userIds, emailAddresses, foundUsersCount } = await fetchUsersByType(
        users,
        userType
    );

    const updatedEmailNotification = await EmailNotification.findByIdAndUpdate(
        emailNotificationId,
        {
            userType,
            emailTitle,
            emailContent,
            users: userIds,
        },
        { new: true }
    );

    await sendEmail({
        email: emailAddresses,
        subject: emailTitle,
        html: emailContent,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                updatedEmailNotification,
                "Email Notification updated successfully"
            )
        );
});

const deleteEmailNotification = asyncHandler(async (req, res) => {
    const { emailNotificationId } = req.params;
    isValidId(emailNotificationId);

    const deletedEmailNotification = await EmailNotification.findByIdAndDelete(
        emailNotificationId
    );

    if (!deletedEmailNotification) {
        throw new ApiError(404, "Email Notification not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                deletedEmailNotification,
                "Email Notification deleted successfully"
            )
        );
});

export {
    createEmailNotification,
    getEmailNotifications,
    getEmailNotificationById,
    updateEmailNotification,
    deleteEmailNotification,
};
