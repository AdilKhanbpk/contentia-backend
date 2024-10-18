const PackageModel = require("../../models/admin/adminCustomPackage.model");
const asyncHandler = require("../../utils/asyncHandler");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");

const createCustomPackage = asyncHandler(async (req, res, next) => {});

const getAllCustomPackages = asyncHandler(async (req, res, next) => {
  res.status(200).json({ message: "All custom packages fetched successfully" });
});

const getCustomPackageById = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    message: `Custom package with ID ${req.params.id} fetched successfully`,
  });
});

const updateCustomPackage = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    message: `Custom package with ID ${req.params.id} updated successfully`,
  });
});

const deleteCustomPackage = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    message: `Custom package with ID ${req.params.id} deleted successfully`,
  });
});

module.exports = {
  createCustomPackage,
  getAllCustomPackages,
  getCustomPackageById,
  updateCustomPackage,
  deleteCustomPackage,
};
