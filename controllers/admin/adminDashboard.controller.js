import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import Creator from "../../models/creator.model.js";
import User from "../../models/user.model.js";
import Order from "../../models/orders.model.js";

const getTotalCreators = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [creatorsData, totalCreatorsCount] = await Promise.all([
    Creator.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]),
    Creator.countDocuments(),
  ]);

  const totalCreatorsByMonth = Array(12).fill(0);
  creatorsData.forEach(
    (data) => (totalCreatorsByMonth[data._id.month - 1] = data.count)
  );

  const currentMonthCount =
    creatorsData.find(
      (data) =>
        data._id.year === now.getFullYear() &&
        data._id.month === now.getMonth() + 1
    )?.count || 0;
  const previousMonthCount =
    creatorsData.find(
      (data) =>
        data._id.year === now.getFullYear() && data._id.month === now.getMonth()
    )?.count || 0;
  const percentageChange = previousMonthCount
    ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
    : currentMonthCount * 100;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalCreatorsCount,
        totalCreatorsByMonth,
        currentMonthCount,
        previousMonthCount,
        percentageChange: percentageChange.toFixed(2),
      },
      "Creators statistics and percentage change retrieved successfully"
    )
  );
});

const getTotalUsers = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [customersData, totalCustomersCount] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]),
    User.countDocuments(),
  ]);

  const totalCustomersByMonth = Array(12).fill(0);
  customersData.forEach(
    (data) => (totalCustomersByMonth[data._id.month - 1] = data.count)
  );

  const currentMonthCount =
    customersData.find(
      (data) =>
        data._id.year === now.getFullYear() &&
        data._id.month === now.getMonth() + 1
    )?.count || 0;
  const previousMonthCount =
    customersData.find(
      (data) =>
        data._id.year === now.getFullYear() && data._id.month === now.getMonth()
    )?.count || 0;
  const percentageChange = previousMonthCount
    ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
    : currentMonthCount * 100;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalCustomersCount,
        totalCustomersByMonth,
        currentMonthCount,
        previousMonthCount,
        percentageChange: percentageChange.toFixed(2),
      },
      "Total customers statistics retrieved successfully"
    )
  );
});

const getTotalOrders = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [ordersData, totalOrdersCount] = await Promise.all([
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfYear } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.month": 1 } },
    ]),
    Order.countDocuments(),
  ]);

  const totalOrdersByMonth = Array(12).fill(0);
  ordersData.forEach(
    (data) => (totalOrdersByMonth[data._id.month - 1] = data.count)
  );

  const currentMonthCount =
    ordersData.find(
      (data) =>
        data._id.year === now.getFullYear() &&
        data._id.month === now.getMonth() + 1
    )?.count || 0;
  const previousMonthCount =
    ordersData.find(
      (data) =>
        data._id.year === now.getFullYear() && data._id.month === now.getMonth()
    )?.count || 0;
  const percentageChange = previousMonthCount
    ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
    : currentMonthCount * 100;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        totalOrdersCount,
        totalOrdersByMonth,
        currentMonthCount,
        previousMonthCount,
        percentageChange: percentageChange.toFixed(2),
      },
      "Total orders statistics retrieved successfully"
    )
  );
});

export { getTotalCreators, getTotalUsers, getTotalOrders };
