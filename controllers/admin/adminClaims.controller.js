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
import Claims from "../../models/admin/adminClaims.model.js";
import Order from "../../models/orders.model.js";
import User from "../../models/user.model.js";
import { notificationTemplates } from "../../helpers/notificationTemplates.js";

const createClaim = asyncHandler(async (req, res) => {
    const { claimContent, customerId, orderId, claimDate } = req.body;

    if (!claimContent) {
        throw new ApiError(400, "Please provide claim content");
    }

    isValidId(customerId);
    isValidId(orderId);

    const checkCustomer = await User.findById(customerId);
    const checkOrder = await Order.findById(orderId).populate(
        "assignedCreators"
    );

    if (!checkCustomer) {
        throw new ApiError(404, "Customer not found");
    }

    if (!checkOrder) {
        throw new ApiError(404, "Order not found");
    }

    const createdClaim = await createADocument(Claims, {
        claimContent,
        claimDate,
        customer: checkCustomer._id,
        order: checkOrder._id,
    });

    if (
        Array.isArray(checkOrder.assignedCreators) &&
        checkOrder.assignedCreators.length > 0
    ) {
        checkOrder.assignedCreators.forEach((creator) => {
            const notificationData =
                notificationTemplates.reportAnOrderFromAdmin({
                    creatorName: creator.fullName,
                    creatorEmail: creator.email,
                    creatorPhoneNumber: creator.phoneNumber,
                    targetUsers: [checkCustomer._id],
                    metadata: {
                        orderId: checkOrder._id,
                        customerId: checkCustomer._id,
                    },
                });
            sendNotification(notificationData);
        });
    }

    res.status(201).json(
        new ApiResponse(201, createdClaim, "Claim created successfully")
    );
});

const getClaims = asyncHandler(async (req, res) => {
    const claims = await Claims.find().populate("customer").populate("order");
    return res
        .status(200)
        .json(new ApiResponse(200, claims, "Claims retrieved successfully"));
});

const getClaimById = asyncHandler(async (req, res) => {
    const { claimId } = req.params;

    isValidId(claimId);

    const claim = await Claims.findById(claimId)
        .populate("customer")
        .populate("order");

    return res
        .status(200)
        .json(new ApiResponse(200, claim, "Claim retrieved successfully"));
});

const updateClaim = asyncHandler(async (req, res) => {
    const { claimId } = req.params;
    const { claimContent, claimDate, status } = req.body;

    isValidId(claimId);

    const updatedClaim = await updateById(Claims, claimId, {
        status,
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

    const deletedClaim = await deleteById(Claims, claimId);

    return res
        .status(200)
        .json(new ApiResponse(200, deletedClaim, "Claim deleted successfully"));
});

export { createClaim, getClaims, getClaimById, updateClaim, deleteClaim };
