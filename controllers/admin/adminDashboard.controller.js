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
                data._id.year === now.getFullYear() &&
                data._id.month === now.getMonth()
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
                data._id.year === now.getFullYear() &&
                data._id.month === now.getMonth()
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

    const [monthlyOrders, totalOrdersCount, statusCounts, totalPriceOfCompletedOrdersResult] = await Promise.all([
        // Orders grouped by month
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

        // Total order count
        Order.countDocuments(),

        // Count by order status
        Order.aggregate([
            {
                $group: {
                    _id: "$orderStatus",
                    count: { $sum: 1 },
                },
            },
        ]),

        // Sum of prices for completed orders
        Order.aggregate([
            { $match: { orderStatus: "completed" } },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalPrice" }, // Make sure the field name matches your schema
                },
            },
        ]),
    ]);

    const totalOrdersByMonth = Array(12).fill(0);
    monthlyOrders.forEach(({ _id: { month }, count }) => {
        totalOrdersByMonth[month - 1] = count;
    });

    const currentMonthCount =
        monthlyOrders.find(
            ({ _id }) =>
                _id.year === now.getFullYear() &&
                _id.month === now.getMonth() + 1
        )?.count || 0;

    const previousMonthCount =
        monthlyOrders.find(
            ({ _id }) =>
                _id.year === now.getFullYear() &&
                _id.month === now.getMonth()
        )?.count || 0;

    const percentageChange = previousMonthCount
        ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
        : currentMonthCount * 100;

    const statusCountsMap = statusCounts.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
    }, {});

    const pendingOrders = statusCountsMap["pending"] || 0;
    const revisionOrders = statusCountsMap["revision"] || 0;
    const completedOrders = statusCountsMap["completed"] || 0;
    const activeOrders = statusCountsMap["active"] || 0;
    const canceledOrders = statusCountsMap["canceled"] || 0;

    const totalPriceOfCompletedOrders = totalPriceOfCompletedOrdersResult[0]?.total || 0;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalOrdersCount,
                completedOrders,
                pendingOrders,
                activeOrders,
                revisionOrders,
                canceledOrders,
                totalOrdersByMonth,
                currentMonthCount,
                previousMonthCount,
                percentageChange: percentageChange.toFixed(2),
                totalPriceOfCompletedOrders,
            },
            "Total orders statistics retrieved successfully"
        )
    );
});

const getTotalSales = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [monthlySalesData, totalSalesResult] = await Promise.all([
        Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfYear },
                    orderStatus: "completed",
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    totalSales: { $sum: "$totalPrice" },
                },
            },
            { $sort: { "_id.month": 1 } },
        ]),

        Order.aggregate([
            { $match: { orderStatus: "completed" } },
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalPrice" },
                },
            },
        ]),
    ]);

    const totalSalesByMonth = Array(12).fill(0);
    monthlySalesData.forEach(
        ({ _id: { month }, totalSales }) => {
            totalSalesByMonth[month - 1] = totalSales;
        }
    );

    const currentMonthTotal =
        monthlySalesData.find(
            ({ _id }) =>
                _id.year === now.getFullYear() &&
                _id.month === now.getMonth() + 1
        )?.totalSales || 0;

    const previousMonthTotal =
        monthlySalesData.find(
            ({ _id }) =>
                _id.year === now.getFullYear() &&
                _id.month === now.getMonth()
        )?.totalSales || 0;

    const percentageChange = previousMonthTotal
        ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
        : currentMonthTotal * 100;

    const totalSales = totalSalesResult[0]?.total || 0;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalSales,
                totalSalesByMonth,
                currentMonthTotal,
                previousMonthTotal,
                percentageChange: percentageChange.toFixed(2),
            },
            "Sales statistics and percentage change retrieved successfully"
        )
    );
});


const recentOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find().sort({ createdAt: -1 }).limit(10);
    return res
        .status(200)
        .json(
            new ApiResponse(200, orders, "Recent orders retrieved successfully")
        );
});

export { getTotalCreators, getTotalUsers, getTotalOrders, recentOrders, getTotalSales };
