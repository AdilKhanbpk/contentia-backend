// controllers/adminRevisionsController.js
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { isValidId } from "../utils/commonHelpers.js";
import Revisions from "../models/revision.model.js";
import Order from "../models/orders.model.js";
import User from "../models/user.model.js";
import { notificationTemplates } from "../helpers/notificationTemplates.js";

const createRevision = asyncHandler(async (req, res) => {
    const { revisionContent } = req.body;
    const { orderId } = req.params;

    isValidId(orderId);

    if (!revisionContent) {
        throw new ApiError(400, "Please provide revision content");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.orderStatus === "revision") {
        throw new ApiError(400, "Order is already in revision status");
    }

    if (order.orderStatus !== "completed") {
        throw new ApiError(400, "Only completed orders can be revised");
    }

    const revision = await Revisions.create({
        customer: req.user._id,
        order: orderId,
        revisionContent,
    });

    const notificationData = notificationTemplates.orderRevisionByCustomerOrAdmin({
        orderTitle: order.briefContent.brandName,
        targetUsers: [order.orderOwner],
        metadata: {
            revisionId: revision._id,
            customerName: req.user.fullName,
            customerEmail: req.user.email,
            customerPhoneNumber: req.user.phoneNumber,
        },
    });
    await sendNotification(notificationData);

    order.orderStatus = "revision";
    await order.save();

    return res
        .status(200)
        .json(new ApiResponse(200, revision, "Revision created successfully"));
});


const getRevisions = asyncHandler(async (req, res) => {
    const claims = await Revisions.find().
        populate({
            path: "customer",
            select: "_id fullName email profilePic"
        }).
        populate({
            path: "order",
            select: "_id briefContent.brandName"
        })
    return res
        .status(200)
        .json(new ApiResponse(200, claims, "Revisions retrieved successfully"));
});

const getRevisionById = asyncHandler(async (req, res) => {
    const { revisionId } = req.params;

    isValidId(revisionId);

    const claim = await Revisions.findById(revisionId).
        populate({
            path: "customer",
            select: "_id fullName email profilePic"
        }).
        populate({
            path: "order",
            select: "_id briefContent.brandName"
        })

    return res
        .status(200)
        .json(new ApiResponse(200, claim, "Revision retrieved successfully"));
});

const updateRevision = asyncHandler(async (req, res) => {
    const { revisionId } = req.params;
    const { revisionContent, claimDate, status } = req.body;

    isValidId(revisionId);

    const updatedRevision = await Revisions.findByIdAndUpdate(
        revisionId,
        {
            revisionContent,
            claimDate,
            status,
        },
        { new: true }
    );

    return res
        .status(200)
        .json(new ApiResponse(200, updatedRevision, "Revision updated successfully"));
});

const deleteRevision = asyncHandler(async (req, res) => {
    const { revisionId } = req.params;

    isValidId(revisionId);

    const deletedRevision = await Revisions.findByIdAndDelete(revisionId);

    return res
        .status(200)
        .json(new ApiResponse(200, deletedRevision, "Revision deleted successfully"));
});

export { createRevision, getRevisions, getRevisionById, updateRevision, deleteRevision };
