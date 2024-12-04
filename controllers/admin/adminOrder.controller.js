import mongoose from "mongoose";
import Order from "../../models/orders.model.js";
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

  const validatedCreators = assignedCreators.map((id) => {
    if (!mongoose.isValidObjectId(id)) {
      throw new ApiError(400, `Invalid creator ID: ${id}`);
    }
    return mongoose.Types.ObjectId.createFromHexString(id);
  });

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
    .json(new ApiResponse(200, { orders }, "Orders retrieved successfully"));
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
    .json(new ApiResponse(200, updatedOrder, "Creator approved successfully"));
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
    .json(new ApiResponse(200, updatedOrder, "Creator rejected successfully"));
});

export {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
  approveCreatorOnOrder,
  rejectCreatorOnOrder,
};
