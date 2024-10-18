// controllers/adminPackageController.js
const PackageModel = require("../../models/admin/adminCustomPackage.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

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
  const package = await PackageModel.findById(id);

  if (!package) {
    throw new ApiError(404, `Package not found with id: ${id}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, package, "Package retrieved successfully"));
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
  const package = await PackageModel.findByIdAndDelete(id);

  if (!package) {
    throw new ApiError(404, `Package not found with id: ${id}`);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Package deleted successfully"));
});

module.exports = {
  createCustomPackage,
  getAllCustomPackages,
  getCustomPackageById,
  updateCustomPackage,
  deleteCustomPackage,
};
