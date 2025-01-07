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
import User from "../../models/user.model.js";
import { notificationTemplates } from "../../helpers/notificationTemplates.js";

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

    const customerExists = await User.findById(customer);

    if (!customerExists) {
        throw new ApiError(404, "Customer not found");
    }

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
        orderOwner: customerExists._id,
        assignedCreators: validatedCreators,
        noOfUgc,
        totalPrice,
        additionalServices,
        numberOfRequests: validatedCreators.length,
    });

    if (!newOrder) {
        throw new ApiError(500, "Failed to create order");
    }

    const customerNotification =
        notificationTemplates.orderCreationByAdminForCustomer({
            customerName: customerExists.fullName,
            customerEmail: customerExists.email,
            customerPhoneNumber: customerExists.phoneNumber,
            targetUsers: [customerExists._id],
            metadata: {
                message: "This is a new order notification",
            },
        });

    const creatorNotifications = existingCreators.map((creator) => {
        return notificationTemplates.creatorApprovalForOrderByAdmin({
            creatorName: creator.fullName,
            creatorEmail: creator.email,
            creatorPhoneNumber: creator.phoneNumber,
            targetUsers: [creator._id],
            metadata: {
                message: "This is a new order notification",
            },
        });
    });

    await Promise.all([
        sendNotification(customerNotification),
        ...creatorNotifications.map((notification) =>
            sendNotification(notification)
        ),
    ]);

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
    const { orderId, creatorId } = req.params;

    isValidId(orderId);
    isValidId(creatorId);

    const creator = await Creator.findById(creatorId);
    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.orderStatus !== "pending") {
        throw new ApiError(400, "Order is not in a pending state");
    }

    if (order.assignedCreators.includes(creatorId)) {
        throw new ApiError(400, "Creator is already assigned to this order");
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
            $addToSet: { assignedCreators: creatorId },
            $pull: { appliedCreators: creatorId },
        },
        { new: true }
    );

    if (!updatedOrder) {
        throw new ApiError(500, "Failed to update order");
    }

    const notifications = [
        {
            userType: "creator",
            eventType: "order",
            title: "Order Approved",
            details: `Your request for order ${orderId} has been approved.`,
            users: [creatorId],
            metadata: {
                message: "This is an order approval notification",
                author: req.user.fullName,
                author_role: req.user.role,
            },
        },
        {
            userType: "customer",
            eventType: "order",
            title: "Order Assigned",
            details: `Your order ${orderId} has been assigned to a creator.`,
            users: [order.orderOwner],
            metadata: {
                message: "This is an order assignment notification",
                author: req.user.fullName,
                author_role: req.user.role,
            },
        },
    ];

    await Promise.all(
        notifications.map((notification) => sendNotification(notification))
    );

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedOrder, "Creator approved successfully")
        );
});

const rejectCreatorOnOrder = asyncHandler(async (req, res) => {
    const { orderId, creatorId } = req.params;

    isValidId(orderId);
    isValidId(creatorId);

    const creator = await Creator.findById(creatorId);

    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    const order = await findById(Order, orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.orderStatus !== "pending") {
        throw new ApiError(400, "Order is not pending");
    }

    order.rejectedCreators.push(creatorId);

    order.assignedCreators = order.assignedCreators.filter(
        (id) => id.toString() !== creator._id.toString()
    );

    order.numberOfRequests = order.assignedCreators.length;

    const updatedOrder = await updateById(Order, orderId, {
        assignedCreators: order.assignedCreators,
        numberOfRequests: order.numberOfRequests,
    });

    // Send notification for rejection
    const notification = {
        userType: "creator",
        eventType: "orderRejection",
        title: "Order Rejected",
        details: `Your request for order ${orderId} has been rejected.`,
        users: [creatorId],
        metadata: {
            message: "This is an order rejection notification",
            author: req.user.fullName,
            author_role: req.user.role,
        },
    };

    await sendNotification(notification);

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
                order,
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
