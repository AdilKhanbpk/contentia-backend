import asyncHandler from "../utils/asyncHandler.js";
import Creator from "../models/creator.model.js";
import ApiError from "../utils/ApiError.js";
import { createADocument, findById } from "../utils/dbHelpers.js";
import { cookieOptions } from "./user.controller.js";
import ApiResponse from "../utils/ApiResponse.js";
import { isValidId } from "../utils/commonHelpers.js";

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

  // PENDING
});

const myAssignedOrders = asyncHandler(async (req, res) => {});

const uploadContentToOrder = asyncHandler(async (req, res) => {});

const changeProfilePicture = asyncHandler(async (req, res) => {});

const getNotifications = asyncHandler(async (req, res) => {});

const addOrderToFavorites = asyncHandler(async (req, res) => {});

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
};
