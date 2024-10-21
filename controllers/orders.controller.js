import Orders from "../models/orders.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";

const createOrder = asyncHandler(async (req, res, next) => {
  const {
    orderStatus,
    paymentStatus,
    contentsDelivered,
    additionalServices,
    preferences,
    briefContent,
    orderQuota,
    numberOfRequests,
  } = req.body;

  if (
    !additionalServices ||
    !additionalServices.platform ||
    !additionalServices.duration ||
    !additionalServices.edit ||
    !additionalServices.aspectRatio
  ) {
    throw new ApiError(400, "Please provide all additional services");
  }

  if (
    !briefContent ||
    !briefContent.brandName ||
    !briefContent.brief ||
    !briefContent.productServiceName ||
    !briefContent.productServiceDesc
  ) {
    throw new ApiError(400, "Please provide all brief content");
  }

  const newOrder = await Orders.create({
    orderOwner: req.user._id,
    totalPrice,
    orderStatus,
    paymentStatus,
    contentsDelivered,
    additionalServices,
    preferences,
    briefContent,
    orderQuota,
    numberOfRequests,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, newOrder, "Order created successfully"));
});

const getOrders = asyncHandler(async (req, res) => {
  const orders = await Orders.find({ orderOwner: req.user._id });

  if (!orders) {
    throw new ApiError(404, "No orders found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

const getOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const order = await Orders.findById(orderId);

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
    orderOwner,
    orderStatus,
    paymentStatus,
    contentsDelivered,
    additionalServices,
    preferences,
    briefContent,
    orderQuota,
    numberOfRequests,
  } = req.body;

  const order = await Orders.findByIdAndUpdate(
    orderId,
    {
      orderOwner,
      orderStatus,
      paymentStatus,
      contentsDelivered,
      additionalServices,
      preferences,
      briefContent,
      orderQuota,
      numberOfRequests,
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

  const order = await Orders.findByIdAndDelete(orderId);

  if (!order) {
    throw new ApiError(404, "Order not found or not deleted");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order deleted successfully"));
});

export { createOrder, updateOrder, deleteOrder, getOrder, getOrders };
