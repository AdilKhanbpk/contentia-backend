const CustomerUserModel = require("../../models/admin/adminCustomerUser.model");
const CreatorUserModel = require("../../models/admin/adminCreatorUser.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

// FOR CUSTOMERS

const createCustomer = asyncHandler(async (req, res, next) => {
  const {
    role,
    fullName,
    email,
    phoneNumber,
    termsAndConditionsApproved,
    invoice,
    communication,
  } = req.body;

  if (
    !role ||
    !fullName ||
    !email ||
    !phoneNumber ||
    !termsAndConditionsApproved ||
    !invoice ||
    !communication
  ) {
    throw new ApiError(400, "Please fill all the required fields");
  }

  if (invoice.type === "Individual") {
    const { type, individual } = invoice;
    if (!individual || !type) {
      throw new ApiError(
        400,
        "Invoice Type and all the individual details are required for Individual invoice."
      );
    }
  } else if (invoice.type === "Corporate") {
    const { type, corporate } = invoice;
    if (!corporate || !type) {
      throw new ApiError(
        400,
        "Invoice Type and all the corporate details are required for Corporate invoice."
      );
    }
  } else {
    throw new ApiError(
      400,
      'Invalid invoice type. Must be "Individual" or "Corporate".'
    );
  }

  const newUser = await CustomerUserModel.create({
    role,
    fullName,
    email,
    phoneNumber,
    termsAndConditionsApproved,
    communication,
    invoice,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "User created successfully"));
});

const updateCustomer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const customer = await CustomerUserModel.findById(id);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  const updatedCustomer = await CustomerUserModel.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedCustomer, "Customer updated successfully")
    );
});

const deleteCustomer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const customer = await CustomerUserModel.findById(id);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  await CustomerUserModel.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Customer deleted successfully"));
});

const getSingleCustomer = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const customer = await CustomerUserModel.findById(id);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, customer, "Customer fetched successfully"));
});

const getAllCustomers = asyncHandler(async (req, res) => {
  const customers = await CustomerUserModel.find();
  return res
    .status(200)
    .json(
      new ApiResponse(200, customers, "All customers fetched successfully")
    );
});

// FOR CREATORS

const createCreator = asyncHandler(async (req, res, next) => {
  const {
    role,
    fullName,
    email,
    phoneNumber,
    smsOTP,
    termsAndConditionsApproved,
    creatorPreferences,
    invoiceCreator,
    ...rest
  } = req.body;

  if (
    !role ||
    !fullName ||
    !email ||
    !phoneNumber ||
    !smsOTP ||
    !termsAndConditionsApproved ||
    !creatorPreferences ||
    !invoiceCreator
  ) {
    throw new ApiError(400, "Please fill all the required fields");
  }

  if (invoiceCreator.hasInvoice) {
    if (invoiceCreator.type === "Individual") {
      const { individual } = invoiceCreator;
      console.log(individual);
      if (!individual) {
        throw new ApiError(
          400,
          "All Individual invoice details must include invoiceFullName."
        );
      }
    } else if (invoiceCreator.type === "Corporate") {
      const { corporate } = invoiceCreator;
      console.log(corporate);

      if (!corporate) {
        throw new ApiError(
          400,
          "All Corporate invoice details must include companyName."
        );
      }
    } else {
      throw new ApiError(
        400,
        'Invalid invoice type. Must be "Individual" or "Corporate".'
      );
    }
  }

  if (creatorPreferences.contentType === "Product") {
    if (creatorPreferences.locationAddress) {
      throw new ApiError(
        400,
        "Location address is not required for Product content type."
      );
    }
  } else if (
    creatorPreferences.contentType === "Service" ||
    creatorPreferences.contentType === "Location"
  ) {
    if (
      !creatorPreferences.locationAddress ||
      !creatorPreferences.locationAddress.fullAddress
    ) {
      throw new ApiError(
        400,
        "Address details are required for Service or Location content types."
      );
    }
  }

  const newUser = await CreatorUserModel.create({
    role,
    fullName,
    email,
    phoneNumber,
    smsOTP,
    termsAndConditionsApproved,
    creatorPreferences,
    invoiceCreator,
    ...rest,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newUser, "Creator user created successfully"));
});

const updateCreator = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const creator = await CreatorUserModel.findById(id);

  if (!creator) {
    throw new ApiError(404, "Creator not found");
  }

  const updatedCreator = await CreatorUserModel.findByIdAndUpdate(
    id,
    updateData,
    { new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedCreator, "Creator updated successfully"));
});

const deleteCreator = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const creator = await CreatorUserModel.findById(id);

  if (!creator) {
    throw new ApiError(404, "Creator not found");
  }

  await CreatorUserModel.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Creator deleted successfully"));
});

const getSingleCreator = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const creator = await CreatorUserModel.findById(id);

  if (!creator) {
    throw new ApiError(404, "Creator not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, creator, "Creator fetched successfully"));
});

const getAllCreators = asyncHandler(async (req, res) => {
  const creators = await CreatorUserModel.find();
  return res
    .status(200)
    .json(new ApiResponse(200, creators, "All creators fetched successfully"));
});

module.exports = {
  createCustomer,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
  createCreator,
  getSingleCreator,
  updateCreator,
  deleteCreator,
  getAllCustomers,
  getAllCreators,
};
