import mongoose from "mongoose";
import Order from "../../models/orders.model.js";
import Creator from "../../models/creator.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { isValidId } from "../../utils/commonHelpers.js";
import { sendNotification } from "../admin/adminNotification.controller.js";
import User from "../../models/user.model.js";
import { notificationTemplates } from "../../helpers/notificationTemplates.js";

const createOrder = asyncHandler(async (req, res) => {
    const {
        customer,
        noOfUgc,
        totalPrice,
        assignedCreators = [],
        additionalServices,
    } = req.body;

    if (!customer || !noOfUgc) {
        throw new ApiError(400, "Please provide all order details");
    }

    const customerExists = await User.findById(customer);

    if (!customerExists) {
        throw new ApiError(404, "Customer not found");
    }

    let validatedCreators = [];
    let existingCreators = [];

    if (Array.isArray(assignedCreators) && assignedCreators.length > 0) {
        validatedCreators = assignedCreators.map((id) => {
            if (!mongoose.isValidObjectId(id)) {
                throw new ApiError(400, `Invalid creator ID: ${id}`);
            }
            return mongoose.Types.ObjectId.createFromHexString(id);
        });

        existingCreators = await Creator.find({
            _id: { $in: validatedCreators },
        });

        if (existingCreators.length !== validatedCreators.length) {
            const missingCreators = validatedCreators.filter(
                (id) =>
                    !existingCreators.find((creator) => creator._id.equals(id))
            );
            throw new ApiError(
                404,
                `The following creator IDs were not found: ${missingCreators.join(
                    ", "
                )}`
            );
        }
    }

    if (
        !additionalServices ||
        !("platform" in additionalServices) ||
        !("duration" in additionalServices) ||
        !("edit" in additionalServices) ||
        !("aspectRatio" in additionalServices)
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

    // Create customer notification
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

    // Create creator notifications if there are valid creators
    const creatorNotifications =
        existingCreators.length > 0
            ? existingCreators.map((creator) => {
                  return notificationTemplates.creatorApprovalForOrderByAdmin({
                      creatorName: creator.fullName,
                      creatorEmail: creator.email,
                      creatorPhoneNumber: creator.phoneNumber,
                      targetUsers: [creator._id],
                      metadata: {
                          message: "This is a new order notification",
                      },
                  });
              })
            : [];

    // Send notifications
    const notificationPromises = [
        sendNotification(customerNotification),
        ...creatorNotifications.map((notification) =>
            sendNotification(notification)
        ),
    ];

    await Promise.all(notificationPromises);

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
        .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
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
    // TODO FILES FUNCTIONALITY NEEDS TO BE ADDED IN FUTURE
    // TODO ASSIGNED CREATORS VALIDATION AND ORDER OWNER VALIDATION
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

    const order = await Order.findByIdAndUpdate(
        orderId,
        {
            noOfUgc,
            orderOwner,
            orderStatus,
            paymentStatus,
            contentsDelivered,
            additionalServices,
            preferences,
            briefContent,
            orderQuota,
            uploadFiles,
            numberOfRequests: updatedAssignedCreator.length,
            assignedCreators: updatedAssignedCreator,
        },
        { new: true }
    );

    if (!order) {
        throw new ApiError(404, "Order not updated or not found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order updated successfully"));
});

const deleteOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const deletedOrder = await Order.findByIdAndDelete(orderId);

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

    if (order.assignedCreators.includes(creatorId)) {
        throw new ApiError(400, "Creator is already assigned to this order");
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
            orderStatus: "active",
            $addToSet: { assignedCreators: creatorId },
            $pull: { appliedCreators: creatorId },
        },
        { new: true }
    );

    if (!updatedOrder) {
        throw new ApiError(500, "Failed to update order");
    }

    const creatorNotification =
        notificationTemplates.creatorApprovalForOrderByAdmin({
            creatorName: creator.fullName,
            creatorEmail: creator.email,
            creatorPhoneNumber: creator.phoneNumber,
            targetUsers: [creator._id],
            metadata: {
                message: "You have been approved for the order",
            },
        });

    const customerNotification =
        notificationTemplates.customerNotificationForOrderAssignedToCreator({
            creatorName: creator.fullName,
            creatorEmail: creator.email,
            creatorPhoneNumber: creator.phoneNumber,
            targetUsers: [order.orderOwner],
            metadata: {
                message: "A creator has been assigned to your order",
            },
        });

    await Promise.all([
        sendNotification(creatorNotification),
        sendNotification(customerNotification),
    ]);

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

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (!order.appliedCreators.includes(creatorId)) {
        throw new ApiError(400, "Creator is not applied to this order");
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
            $addToSet: { rejectedCreators: creatorId },
            $pull: { appliedCreators: creatorId },
        },
        { new: true }
    );

    if (!updatedOrder) {
        throw new ApiError(500, "Failed to update order");
    }

    const notificationData = notificationTemplates.creatorRejectionForOrder({
        creatorName: creator.fullName,
        creatorEmail: creator.email,
        creatorPhoneNumber: creator.phoneNumber,
        targetUsers: [creator._id],
        metadata: {
            message: "You have been rejected for the order",
        },
    });

    await sendNotification(notificationData);

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
