import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  createADocument,
  deleteById,
  findAll,
  findById,
} from "../../utils/dbHelpers.js";
import CreatorModel from "../../models/creator.model.js";
import { isValidId } from "../../utils/commonHelpers.js";

// FOR CREATORS

const createCreator = asyncHandler(async (req, res) => {
  const {
    fullName,
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
    !tckn ||
    !email ||
    !phoneNumber ||
    !userAgreement ||
    !accountType ||
    !invoiceType
  ) {
    throw new ApiError(400, "Please fill all the required fields");
  }

  if (accountType === "individual") {
    console.log("Account type:", accountType);
    if (
      !paymentInformation?.ibanNumber ||
      !paymentInformation?.address ||
      !paymentInformation?.fullName ||
      !paymentInformation?.trId
    ) {
      throw new ApiError(
        400,
        "Please fill all required fields for individual account type"
      );
    }
  } else if (accountType === "institutional") {
    console.log("Account type:", accountType);
    if (
      !paymentInformation?.ibanNumber ||
      !paymentInformation?.address ||
      !paymentInformation?.companyName ||
      !paymentInformation?.taxNumber ||
      !paymentInformation?.taxOffice
    ) {
      throw new ApiError(
        400,
        "Please fill all required fields for institutional account type"
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
    if (
      !billingInformation?.address ||
      !billingInformation?.trId ||
      !billingInformation?.fullName
    ) {
      throw new ApiError(
        400,
        "Please fill all required fields for individual invoice type"
      );
    }
  } else if (invoiceType === "institutional") {
    console.log("Invoice type:", invoiceType);
    if (
      !billingInformation?.address ||
      !billingInformation?.trId ||
      !billingInformation?.companyName ||
      !billingInformation?.taxNumber ||
      !billingInformation?.taxOffice
    ) {
      throw new ApiError(
        400,
        "Please fill all required fields for institutional invoice type"
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

  const newUser = await createADocument(CreatorModel, {
    fullName,
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

  const updatedCreator = await CreatorModel.findByIdAndUpdate(
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

  const creator = await deleteById(CreatorModel, creatorId);

  return res
    .status(200)
    .json(new ApiResponse(200, creator, "Creator deleted successfully"));
});

const getSingleCreator = asyncHandler(async (req, res) => {
  const { creatorId } = req.params;

  isValidId(creatorId);

  const creator = await findById(CreatorModel, creatorId);

  return res
    .status(200)
    .json(new ApiResponse(200, creator, "Creator retrieved"));
});

const getAllCreators = asyncHandler(async (req, res) => {
  const creators = await findAll(CreatorModel);
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
