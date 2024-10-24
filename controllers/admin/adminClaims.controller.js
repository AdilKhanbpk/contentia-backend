// controllers/adminClaimsController.js
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import {
  createADocument,
  deleteById,
  findAll,
  findById,
  updateById,
} from "../../utils/dbHelpers.js";
import AdminClaims from "../../models/admin/adminClaims.model.js";

const createClaim = asyncHandler(async (req, res) => {
  const { claimContent, claimDate } = req.body;
  const { customerId, orderId } = req.params;

  if (!claimContent) {
    throw new ApiError(400, "Please provide claim content");
  }

  isValidId(customerId);
  isValidId(orderId);

  const createdClaim = await createADocument(AdminClaims, {
    claimContent,
    claimDate,
    customer: customerId,
    order: orderId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, createdClaim, "Claim created successfully"));
});

const getClaims = asyncHandler(async (req, res) => {
  const claims = await findAll(AdminClaims);
  return res
    .status(200)
    .json(new ApiResponse(200, claims, "Claims retrieved successfully"));
});

const getClaimById = asyncHandler(async (req, res) => {
  const { claimId } = req.params;

  isValidId(claimId);

  const claim = await findById(AdminClaims, claimId);

  return res
    .status(200)
    .json(new ApiResponse(200, claim, "Claim retrieved successfully"));
});

const updateClaim = asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const { claimContent, claimDate } = req.body;

  isValidId(claimId);

  const updatedClaim = await updateById(AdminClaims, claimId, {
    claimContent,
    claimDate,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedClaim, "Claim updated successfully"));
});

const deleteClaim = asyncHandler(async (req, res) => {
  const { claimId } = req.params;

  isValidId(claimId);

  const deletedClaim = await deleteById(AdminClaims, claimId);

  return res
    .status(200)
    .json(new ApiResponse(200, deletedClaim, "Claim deleted successfully"));
});

export { createClaim, getClaims, getClaimById, updateClaim, deleteClaim };
