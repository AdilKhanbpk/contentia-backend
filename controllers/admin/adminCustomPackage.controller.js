// controllers/adminPackageController.js
import PackageModel from "../../models/admin/adminCustomPackage.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

const createCustomPackage = asyncHandler(async (req, res) => {
  const newPackage = await PackageModel.create(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, newPackage, "Package created successfully"));
});

const getAllCustomPackages = asyncHandler(async (req, res) => {
  const packages = await PackageModel.find();
  return res
    .status(200)
    .json(new ApiResponse(200, packages, "Packages retrieved successfully"));
});

const getCustomPackageById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const newPackage = await PackageModel.findById(id);

  if (!newPackage) {
    throw new ApiError(404, `Package not found with id: ${id}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, newPackage, "Package retrieved successfully"));
});

const updateCustomPackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedPackage = await PackageModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedPackage) {
    throw new ApiError(404, `Package not found with id: ${id}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPackage, "Package updated successfully"));
});

const deleteCustomPackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const newPackage = await PackageModel.findByIdAndDelete(id);

  if (!newPackage) {
    throw new ApiError(404, `Package not found with id: ${id}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Package deleted successfully"));
});

export {
  createCustomPackage,
  getAllCustomPackages,
  getCustomPackageById,
  updateCustomPackage,
  deleteCustomPackage,
};
