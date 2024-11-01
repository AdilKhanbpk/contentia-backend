import asyncHandler from "../utils/asyncHandler.js";
import CreatorModel from "../models/creator.model.js";
import ApiError from "../utils/ApiError.js";
import { createADocument } from "../utils/dbHelpers.js";

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

export { createCreator };
