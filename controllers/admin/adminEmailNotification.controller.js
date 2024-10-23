import EmailNotification from "../../models/admin/adminEmailNotification.model.js";
import Creator from "../../models/becomeCreator.model.js";
import User from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { createADocument } from "../../utils/dbHelpers.js";
import sendEmail from "../../utils/email.js";

const createEmailNotification = asyncHandler(async (req, res) => {
  const { emailTitle, emailContent, users, userType } = req.body;

  if (!emailTitle || !emailContent || !userType) {
    throw new ApiError(400, "Please provide all the required fields");
  }

  let userIds = [];
  let emailAddresses = [];

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
    emailAddresses = creators.map((creator) => creator.email);
  } else if (userType === "customer") {
    const customers = await User.find({ _id: { $in: users } });
    checkMissingIds(users, customers, "customer");
    userIds = customers.map((customer) => customer._id);
    emailAddresses = customers.map((customer) => customer.email);
  } else {
    throw new ApiError(400, "Invalid user type provided");
  }

  const createEmailNotification = await createADocument(EmailNotification, {
    userType,
    emailTitle,
    emailContent,
    users: userIds,
  });

  await sendEmail({
    email: emailAddresses,
    subject: emailTitle,
    // text: emailContent,
    html: emailContent,
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createEmailNotification,
        "Email Notification created and Sent"
      )
    );
});

const getEmailNotifications = asyncHandler(async (req, res) => {});

const getEmailNotificationById = asyncHandler(async (req, res) => {});

const updateEmailNotification = asyncHandler(async (req, res) => {});

const deleteEmailNotification = asyncHandler(async (req, res) => {});

export {
  createEmailNotification,
  getEmailNotifications,
  getEmailNotificationById,
  updateEmailNotification,
  deleteEmailNotification,
};
