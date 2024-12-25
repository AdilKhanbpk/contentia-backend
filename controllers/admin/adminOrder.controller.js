import mongoose from "mongoose";
import Order from "../../models/orders.model.js";
import Creator from "../../models/creator.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import {
    deleteById,
    findAll,
    findById,
    updateById,
} from "../../utils/dbHelpers.js";
import { isValidId } from "../../utils/commonHelpers.js";
import { sendNotification } from "../admin/adminNotification.controller.js";

const createOrder = asyncHandler(async (req, res) => {
    const {
        customer,
        noOfUgc,
        totalPrice,
        assignedCreators,
        additionalServices,
    } = req.body;

    if (!customer || !noOfUgc) {
        throw new ApiError(400, "Please provide all order details");
    }

    if (!Array.isArray(assignedCreators) || !assignedCreators.length) {
        throw new ApiError(400, "Assigned creators must be a non-empty array");
    }

    // Validate creator IDs and check if they exist in the database
    const validatedCreators = assignedCreators.map((id) => {
        if (!mongoose.isValidObjectId(id)) {
            throw new ApiError(400, `Invalid creator ID: ${id}`);
        }
        return mongoose.Types.ObjectId.createFromHexString(id);
    });

    const existingCreators = await Creator.find({
        _id: { $in: validatedCreators },
    });

    if (existingCreators.length !== validatedCreators.length) {
        const missingCreators = validatedCreators.filter(
            (id) => !existingCreators.find((creator) => creator._id.equals(id))
        );
        throw new ApiError(
            404,
            `The following creator IDs were not found: ${missingCreators.join(
                ", "
            )}`
        );
    }

    if (
        !additionalServices ||
        !additionalServices.platform ||
        !additionalServices.duration ||
        !additionalServices.edit ||
        !additionalServices.aspectRatio
    ) {
        throw new ApiError(400, "Please provide all additional services");
    }

    const newOrder = await Order.create({
        orderOwner: customer,
        assignedCreators: validatedCreators,
        noOfUgc,
        totalPrice,
        additionalServices,
        numberOfRequests: validatedCreators.length,
    });

    if (!newOrder) {
        throw new ApiError(500, "Failed to create order");
    }

    const notification = {
        userType: "customer",
        eventType: "order",
        title: "New Order",
        details: `A new order has been created for customer ${customer} with ID ${newOrder._id}. The order is assigned to ${validatedCreators.length} creators and includes ${noOfUgc} UGCs with a total price of ${totalPrice}.`,
        users: [customer],
        metadata: {
            message: "This is an order notification",
            author: req.user.fullName,
            author_role: req.user.role,
        },
    };

    await sendNotification(notification);

    return res
        .status(201)
        .json(new ApiResponse(201, newOrder, "Order created successfully"));
});

const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .populate("orderOwner")
        .populate("assignedCreators");

    return res
        .status(200)
        .json(
            new ApiResponse(200, { orders }, "Orders retrieved successfully")
        );
});

const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    isValidId(orderId);

    const order = await Order.findById(orderId)
        .populate("orderOwner")
        .populate("assignedCreators");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order retrieved successfully"));
});

const updateOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const {
        noOfUgc,
        orderOwner,
        assignedCreators,
        orderStatus,
        paymentStatus,
        contentsDelivered,
        additionalServices,
        preferences,
        briefContent,
        orderQuota,
        numberOfRequests,
        uploadFiles,
    } = req.body;

    let updatedAssignedCreator = [];
    if (assignedCreators) {
        updatedAssignedCreator = assignedCreators
            .split(",")
            .map((id) => mongoose.Types.ObjectId.createFromHexString(id));
    }

    const order = await updateById(Order, orderId, {
        noOfUgc,
        orderOwner,
        orderStatus,
        assignedCreators: updatedAssignedCreator,
        paymentStatus,
        contentsDelivered,
        additionalServices,
        preferences,
        briefContent,
        orderQuota,
        numberOfRequests: updatedAssignedCreator.length,
        uploadFiles,
    });

    if (!order) {
        throw new ApiError(404, "Order not updated or not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order updated successfully"));
});

const deleteOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const deletedOrder = await deleteById(Order, orderId);

    return res
        .status(200)
        .json(new ApiResponse(200, deletedOrder, "Order deleted successfully"));
});

const approveCreatorOnOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { creatorId } = req.body;

    isValidId(orderId);
    isValidId(creatorId);

    const order = await findById(Order, orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.orderStatus !== "pending") {
        throw new ApiError(400, "Order is not pending");
    }

    if (order.assignedCreators.includes(creatorId)) {
        throw new ApiError(400, "Creator is already assigned to the order");
    }

    order.assignedCreators.push(creatorId);
    order.numberOfRequests = order.assignedCreators.length;

    const updatedOrder = await updateById(Order, orderId, {
        assignedCreators: order.assignedCreators,
        numberOfRequests: order.numberOfRequests,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedOrder, "Creator approved successfully")
        );
});

const rejectCreatorOnOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { creatorId } = req.body;

    isValidId(orderId);
    isValidId(creatorId);

    const order = await findById(Order, orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.orderStatus !== "pending") {
        throw new ApiError(400, "Order is not pending");
    }

    if (!order.assignedCreators.includes(creatorId)) {
        throw new ApiError(400, "Creator is not assigned to the order");
    }

    order.assignedCreators = order.assignedCreators.filter(
        (id) => id !== creatorId
    );

    order.numberOfRequests = order.assignedCreators.length;

    const updatedOrder = await updateById(Order, orderId, {
        assignedCreators: order.assignedCreators,
        numberOfRequests: order.numberOfRequests,
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedOrder, "Creator rejected successfully")
        );
});

const getAppliedCreatorsOnOrders = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    isValidId(orderId);

    const order = await Order.findById(orderId).populate("appliedCreators");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                order.appliedCreators,
                "Creators applied to order retrieved successfully"
            )
        );
});

export {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    approveCreatorOnOrder,
    rejectCreatorOnOrder,
    getAppliedCreatorsOnOrders,
};
