import User from "../../models/user.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
  createADocument,
  deleteById,
  findAll,
  findById,
  updateById,
} from "../../utils/dbHelpers.js";

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

  const newUser = await User.create({
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
  const { customerId } = req.params;
  const updateData = req.body;

  const customer = await CustomerUserModel.findById(customerId);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  const updatedCustomer = await CustomerUserModel.findByIdAndUpdate(
    customerId,
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
  const { customerId } = req.params;

  const customer = await CustomerUserModel.findById(customerId);

  if (!customer) {
    throw new ApiError(404, "Customer not found");
  }

  await CustomerUserModel.findByIdAndDelete(customerId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Customer deleted successfully"));
});

const getSingleCustomer = asyncHandler(async (req, res, next) => {
  const { customerId } = req.params;

  const customer = await CustomerUserModel.findById(customerId);

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

export {
  createCustomer,
  getSingleCustomer,
  updateCustomer,
  deleteCustomer,
  getAllCustomers,
};
