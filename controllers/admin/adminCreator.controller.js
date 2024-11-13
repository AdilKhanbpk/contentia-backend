import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  createADocument,
  deleteById,
  findAll,
  findById,
} from "../../utils/dbHelpers.js";
import Creator from "../../models/creator.model.js";
import { isValidId } from "../../utils/commonHelpers.js";

// FOR CREATORS

const createCreator = asyncHandler(async (req, res) => {
  const {
    fullName,
    creatorType,
    tckn,
    password,
    email,
    dateOfBirth,
    gender,
    phoneNumber,
    isVerified,
    addressOne,
    addressTwo,
    accountType,
    invoiceType,
    paymentInformation,
    billingInformation,
    preferences,
  } = req.body;

  if (
    !isVerified ||
    !fullName ||
    !password ||
    !creatorType ||
    !tckn ||
    !dateOfBirth ||
    !gender ||
    !addressOne ||
    !addressTwo ||
    !email ||
    !phoneNumber ||
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
    tckn,
    password,
    creatorType,
    email,
    dateOfBirth,
    gender,
    phoneNumber,
    isVerified,
    addressOne,
    addressTwo,
    accountType,
    invoiceType,
    paymentInformation,
    billingInformation,
    preferences,
    userAgreement: true,
    approvedCommercial: true,
  });

  return res.status(201).json({
    status: 201,
    data: newUser,
    message: "Creator user created successfully",
  });
});

const updateCreator = asyncHandler(async (req, res) => {
  const { creatorId } = req.params;
  const updateData = req.body;

  const setFields = {};
  for (const [key, value] of Object.entries(updateData)) {
    if (typeof value === "object" && !Array.isArray(value)) {
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

const deleteCreator = asyncHandler(async (req, res) => {
  const { creatorId } = req.params;

  isValidId(creatorId);

  const creator = await deleteById(Creator, creatorId);

  return res
    .status(200)
    .json(new ApiResponse(200, creator, "Creator deleted successfully"));
});

const getSingleCreator = asyncHandler(async (req, res) => {
  const { creatorId } = req.params;

  isValidId(creatorId);

  const creator = await findById(Creator, creatorId);

  return res
    .status(200)
    .json(new ApiResponse(200, creator, "Creator retrieved"));
});

const getAllCreators = asyncHandler(async (req, res) => {
  const creators = await findAll(Creator);
  return res
    .status(200)
    .json(new ApiResponse(200, creators, "Creators retrieved"));
});

export {
  createCreator,
  getSingleCreator,
  updateCreator,
  deleteCreator,
  getAllCreators,
};
