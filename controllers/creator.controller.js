import asyncHandler from "../utils/asyncHandler.js";
import Creator from "../models/creator.model.js";
import Orders from "../models/orders.model.js";
import Notifications from "../models/admin/adminNotification.model.js";
import ApiError from "../utils/ApiError.js";
import { createADocument, findById } from "../utils/dbHelpers.js";
import { cookieOptions } from "./user.controller.js";
import ApiResponse from "../utils/ApiResponse.js";
import { isValidId } from "../utils/commonHelpers.js";
import {
  listAllFilesInFolder,
  uploadFilesToFolder,
  createFolder,
  getFolderIdByName,
} from "../utils/googleDrive.js";
import {
  uploadFileToCloudinary,
  uploadMultipleFilesToCloudinary,
} from "../utils/Cloudinary.js";

export const generateTokens = async (userId) => {
  const user = await Creator.findById(userId);
  if (!user) throw new ApiError(404, "User not found");

  const accessToken = user.AccessToken();
  await user.save({ validateBeforeSave: false });

  return { accessToken };
};

const loginCreator = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Please provide email and password");
  }

  const user = await Creator.findOne({ email });

  if (!user) {
    throw new ApiError(400, "Creator not found");
  }

  const isPasswordCorrect = await user.ComparePassword(password);

  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials");
  }

  const { accessToken } = await generateTokens(user._id);

  const userWithoutPassword = await Creator.findById(user._id).select(
    "-password"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        { userWithoutPassword, accessToken },
        "Creator logged in successfully"
      )
    );
});

const createCreator = asyncHandler(async (req, res) => {
  const {
    fullName,
    password,
    tckn,
    email,
    phoneNumber,
    addressDetails,
    userAgreement,
    accountType,
    invoiceType,
    paymentInformation,
    billingInformation,
    preferences,
    ...rest
  } = req.body;

  if (
    !fullName ||
    !password ||
    !tckn ||
    !email ||
    !phoneNumber ||
    !userAgreement ||
    !accountType ||
    !invoiceType
  ) {
    throw new ApiError(400, "Please fill all the required fields");
  }

  if (
    !addressDetails ||
    !addressDetails?.addressOne ||
    !addressDetails?.addressTwo ||
    !addressDetails?.zipCode ||
    !addressDetails?.country
  ) {
    throw new ApiError(400, "Please fill address details");
  }

  const checkEmail = await Creator.findOne({ email });

  if (checkEmail) {
    throw new ApiError(400, "Email address is already in use.");
  }

  if (accountType === "individual") {
    console.log("Account type:", accountType);

    if (!paymentInformation?.ibanNumber || !paymentInformation?.address) {
      throw new ApiError(
        400,
        "Please fill ibanNumber and address for individual account type"
      );
    }

    if (!paymentInformation?.fullName || !paymentInformation?.trId) {
      throw new ApiError(
        400,
        "Please fill fullName and trId for individual account type"
      );
    }
  } else if (accountType === "institutional") {
    console.log("Account type:", accountType);
    if (
      !paymentInformation?.companyName ||
      !paymentInformation?.taxNumber ||
      !paymentInformation?.taxOffice
    ) {
      throw new ApiError(
        400,
        "Please fill companyName, taxNumber, and taxOffice for institutional account type"
      );
    }
  } else {
    throw new ApiError(
      400,
      "Account type must be 'individual' or 'institutional'"
    );
  }

  if (invoiceType === "individual") {
    console.log("Invoice type:", invoiceType);
    console.log(billingInformation);

    if (!billingInformation?.invoiceStatus || !billingInformation?.address) {
      throw new ApiError(
        400,
        "Please fill invoiceStatus and address for individual invoice type"
      );
    }

    if (!billingInformation?.fullName) {
      throw new ApiError(
        400,
        "Please fill fullName for individual invoice type"
      );
    }
  } else if (invoiceType === "institutional") {
    console.log("Invoice type:", invoiceType);
    if (
      !billingInformation?.companyName ||
      !billingInformation?.taxNumber ||
      !billingInformation?.taxOffice
    ) {
      throw new ApiError(
        400,
        "Please fill companyName, taxNumber, and taxOffice for institutional invoice type"
      );
    }
  } else {
    throw new ApiError(
      400,
      "Invoice type must be 'individual' or 'institutional'"
    );
  }

  if (
    preferences?.contentInformation?.contentType === "product" ||
    preferences?.contentInformation?.contentType === "space"
  ) {
    if (!preferences.contentInformation.addressDetails) {
      throw new ApiError(
        400,
        "Address details are required for product or space"
      );
    }
  }

  const newUser = await createADocument(Creator, {
    fullName,
    password,
    tckn,
    email,
    phoneNumber,
    userAgreement,
    addressDetails,
    accountType,
    invoiceType,
    paymentInformation,
    billingInformation,
    preferences,
    ...rest,
  });

  return res.status(201).json({
    status: 201,
    data: newUser,
    message: "Creator user created successfully",
  });
});

const updateCreator = asyncHandler(async (req, res) => {
  const creatorId = req.user._id;
  isValidId(creatorId);

  const updateData = req.body;

  const setFields = {};
  for (const [key, value] of Object.entries(updateData)) {
    if (key === "email") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailPattern.test(value)) {
        throw new ApiError(400, "Invalid email format.");
      }
      const emailExists = await Creator.findOne({
        email: value,
        _id: { $ne: creatorId },
      });
      if (emailExists) {
        throw new ApiError(400, "Email already exists.");
      } else {
        setFields[key] = value;
      }
    } else if (key === "password") {
      throw new ApiError(
        400,
        "Password updates are not allowed in this endpoint."
      );
    } else if (typeof value === "object" && !Array.isArray(value)) {
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        setFields[`${key}.${nestedKey}`] = nestedValue;
      }
    } else {
      setFields[key] = value;
    }
  }

  const updatedCreator = await Creator.findByIdAndUpdate(
    creatorId,
    { $set: setFields },
    { new: true }
  );

  if (!updatedCreator) {
    throw new ApiError(404, "Creator not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCreator, "Creator updated successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmNewPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    throw new ApiError(400, "Please provide all the required fields");
  }

  isValidId(req.user._id);

  const creator = await findById(Creator, req.user._id);

  const isPasswordCorrect = await creator.ComparePassword(currentPassword);
  if (!isPasswordCorrect) {
    throw new ApiError(400, "Current password is incorrect");
  }

  if (newPassword !== confirmNewPassword) {
    throw new ApiError(400, "Passwords do not match");
  }

  creator.password = newPassword;
  await creator.save();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Password changed successfully"));
});

const applyForOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new ApiError(400, "Please provide orderId");
  }

  isValidId(orderId);

  const order = await findById(Orders, orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  if (order.orderStatus !== "pending") {
    throw new ApiError(400, "Order is assigned to someone or is not pending");
  }

  const creator = await findById(Creator, req.user._id);

  if (!creator) {
    throw new ApiError(404, "Creator not found");
  }

  order.assignedCreators.push(creator._id);

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "You Have Applied Successfully"));
});

const getAllAppliedOrders = asyncHandler(async (req, res) => {
  const creatorId = req.user._id;

  isValidId(creatorId);

  const appliedOrders = await Orders.find({
    assignedCreators: creatorId,
    orderStatus: "pending",
  });

  if (!appliedOrders || appliedOrders.length === 0) {
    throw new ApiError(404, "No pending orders found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        appliedOrders,
        "Applied orders retrieved successfully"
      )
    );
});

const myAssignedOrders = asyncHandler(async (req, res) => {
  const creatorId = req.user._id;

  isValidId(creatorId);

  const assignedOrders = await Orders.find({
    assignedCreators: creatorId,
    orderStatus: "active",
  });

  if (!assignedOrders || assignedOrders.length === 0) {
    throw new ApiError(404, "No active orders found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        assignedOrders,
        "Assigned orders retrieved successfully"
      )
    );
});

const changeProfilePicture = asyncHandler(async (req, res) => {
  const creatorId = req.user._id;

  isValidId(creatorId);

  const creator = await findById(Creator, creatorId);

  if (!creator) {
    throw new ApiError(404, "Creator not found");
  }

  const profilePath = req.files.path;

  const uploadedImage = await uploadFileToCloudinary(profilePath, {
    folder: "creator-profile",
    resource_type: "image",
  });

  if (!uploadedImage) {
    throw new ApiError(500, "Failed to upload profile picture");
  }

  creator.profilePicture = uploadedImage.url;

  await creator.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, creator, "Profile picture updated successfully")
    );
});

const uploadContentToOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const creatorId = req.user._id;

  isValidId(orderId);
  isValidId(creatorId);

  const order = await findById(Orders, orderId);
  if (!order) {
    throw new ApiError(404, "Order not found");
  }
  if (order.orderStatus !== "pending") {
    throw new ApiError(400, "Order is not pending");
  }

  const creator = await findById(Creator, creatorId);
  if (!creator) {
    throw new ApiError(404, "Creator not found");
  }

  if (!req.files || req.files.length === 0) {
    throw new ApiError(400, "No files uploaded");
  }
  const filesPath = req.files.map((file) => file.path);

  // UPLOAD TO CLOUDINARY LOGIC

  // let uploadedFiles;
  // try {
  //   uploadedFiles = await uploadMultipleFilesToCloudinary(filesPath, {
  //     folder: `${creatorId}-${orderId}`,
  //     resource_type: "file",
  //   });
  // } catch (error) {
  //   throw new ApiError(500, "Failed to upload files");
  // }

  // if (!uploadedFiles || uploadedFiles.length === 0) {
  //   throw new ApiError(500, "Failed to upload files");
  // }

  // const content = uploadedFiles.map((file) => ({
  //   url: file.url,
  //   publicId: file.public_id,
  // }));

  // order.uploadFiles = {
  //   uploadedBy: creator._id,
  //   fileUrls: content,
  //   uploadedDate: Date.now(),
  // };

  // await order.save();

  // UPLOAD TO GOOGLE DRIVE LOGIC

  try {
    // Check or create order folder
    let orderFolderId = await getFolderIdByName(orderId);
    if (!orderFolderId) {
      orderFolderId = await createFolder(orderId);
    }

    // Check or create creator folder within the order folder
    let creatorFolderId = await getFolderIdByName(creatorId);
    if (!creatorFolderId) {
      creatorFolderId = await createFolder(creatorId, orderFolderId);
    }

    // Upload files to the creator's folder
    const uploadedFilesToGoogleDrive = await uploadFilesToFolder(
      creatorFolderId,
      filesPath
    );

    if (
      !uploadedFilesToGoogleDrive ||
      uploadedFilesToGoogleDrive.length === 0
    ) {
      throw new ApiError(500, "Failed to upload files to Google Drive");
    }

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          order,
          uploadedFiles: uploadedFilesToGoogleDrive,
        },
        "Content uploaded successfully to Google Drive"
      )
    );
  } catch (error) {
    throw new ApiError(500, `Google Drive upload error: ${error.message}`);
  }
});

const getNotifications = asyncHandler(async (req, res) => {
  const creatorId = req.user._id;

  isValidId(creatorId);

  const notifications = await Notifications.find({ creatorId });

  return res
    .status(200)
    .json(new ApiResponse(200, notifications, "Notifications retrieved"));
});

const addOrderToFavorites = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  isValidId(orderId);

  const creatorId = req.user._id;

  isValidId(creatorId);

  const creator = await findById(Creator, creatorId);

  if (!creator) {
    throw new ApiError(404, "Creator not found");
  }

  const order = await findById(Orders, orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  creator.favoriteOrders.push(order._id);

  await creator.save();

  return res
    .status(200)
    .json(new ApiResponse(200, creator, "Order added to favorites"));
});

const removeOrderFromFavorites = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  isValidId(orderId);

  const creatorId = req.user._id;

  isValidId(creatorId);

  const creator = await findById(Creator, creatorId);

  if (!creator) {
    throw new ApiError(404, "Creator not found");
  }

  const order = await findById(Orders, orderId);

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  creator.favoriteOrders = creator.favoriteOrders.filter(
    (id) => id.toString() !== orderId.toString()
  );

  await creator.save();

  return res
    .status(200)
    .json(new ApiResponse(200, creator, "Order removed from favorites"));
});

const getMyUploadedFolders = asyncHandler(async (req, res) => {});

export {
  loginCreator,
  createCreator,
  updateCreator,
  applyForOrder,
  changePassword,
  getNotifications,
  changeProfilePicture,
  addOrderToFavorites,
  myAssignedOrders,
  uploadContentToOrder,
  getAllAppliedOrders,
  removeOrderFromFavorites,
  getMyUploadedFolders,
};
