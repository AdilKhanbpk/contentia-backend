const adminOrderModel = require("../../models/admin/adminOrder.model");
const ApiError = require("../../utils/ApiError");
const ApiResponse = require("../../utils/ApiResponse");
const asyncHandler = require("../../utils/asyncHandler");

const createOrder = asyncHandler(async (req, res) => {});

const getOrders = asyncHandler(async (req, res) => {});

const getOrderById = asyncHandler(async (req, res) => {});

const updateOrder = asyncHandler(async (req, res) => {});

const deleteOrder = asyncHandler(async (req, res) => {});

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrder,
  deleteOrder,
};
