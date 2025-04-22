import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import Creator from "../../models/creator.model.js";
import User from "../../models/user.model.js";
import Order from "../../models/orders.model.js";
import AdditionalServiceModel from "../../models/admin/adminAdditionalService.model.js";

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

    // Get start of current week (Monday)
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // adjust when Sunday
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const [
        monthlyOrders,
        totalOrdersCount,
        statusCounts,
        totalPriceOfCompletedOrdersResult,
        dailyOrdersThisWeek,
        completedOrdersThisMonthCount
    ] = await Promise.all([
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
                    total: { $sum: "$totalPrice" },
                },
            },
        ]),

        // Orders grouped by day of current week
        Order.aggregate([
            { $match: { createdAt: { $gte: startOfWeek } } },
            {
                $group: {
                    _id: { dayOfWeek: { $dayOfWeek: "$createdAt" } },
                    count: { $sum: 1 },
                },
            },
        ]),

        // Completed orders in current month
        Order.countDocuments({
            orderStatus: "completed",
            createdAt: {
                $gte: new Date(now.getFullYear(), now.getMonth(), 1),
                $lte: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
            },
        }),
    ]);

    // Monthly order array (Jan - Dec)
    const totalOrdersByMonth = Array(12).fill(0);
    monthlyOrders.forEach(({ _id: { month }, count }) => {
        totalOrdersByMonth[month - 1] = count;
    });

    // Current and previous month count
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

    // Monthly percentage change
    const percentageChange = previousMonthCount
        ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
        : currentMonthCount * 100;

    // Order status counts
    const statusCountsMap = statusCounts.reduce((acc, { _id, count }) => {
        acc[_id] = count;
        return acc;
    }, {});

    const pendingOrders = statusCountsMap["pending"] || 0;
    const revisionOrders = statusCountsMap["revision"] || 0;
    const completedOrders = statusCountsMap["completed"] || 0;
    const activeOrders = statusCountsMap["active"] || 0;
    const canceledOrders = statusCountsMap["canceled"] || 0;

    // Total price of completed orders
    const totalPriceOfCompletedOrders = totalPriceOfCompletedOrdersResult[0]?.total || 0;

    // Weekly orders (Mon - Sun)
    const dayOrderMap = Array(7).fill(0); // [Sun, Mon, ..., Sat]
    dailyOrdersThisWeek.forEach(({ _id: { dayOfWeek }, count }) => {
        dayOrderMap[dayOfWeek - 1] = count;
    });
    const totalOrdersByWeek = [...dayOrderMap.slice(1), dayOrderMap[0]]; // Rearranged to [Mon, ..., Sun]

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
                totalOrdersByWeek,
                currentMonthCount,
                previousMonthCount,
                percentageChange: percentageChange.toFixed(2),
                totalPriceOfCompletedOrders,
                completedOrdersThisMonth: completedOrdersThisMonthCount,
            },
            "Total orders statistics retrieved successfully"
        )
    );
});

const getTotalUsersForCurrentMonth = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const [creatorCount, customerCount] = await Promise.all([
        Creator.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }),
        User.countDocuments({
            createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }),
    ]);

    const totalUsersForCurrentMonth = creatorCount + customerCount;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                creatorCount,
                customerCount,
                totalUsersForCurrentMonth,
            },
            "Total users for the current month retrieved successfully"
        )
    );
});


const getTotalSales = asyncHandler(async (req, res) => {
    const now = new Date();

    // --- Month boundaries ---
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const startOfPreviousMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfPreviousMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // --- Week boundaries ---
    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfPreviousWeek = new Date(startOfWeek);
    startOfPreviousWeek.setDate(startOfPreviousWeek.getDate() - 7);
    const endOfPreviousWeek = new Date(startOfWeek);
    endOfPreviousWeek.setMilliseconds(-1); // One ms before current week's start

    const [
        monthlySalesData,
        totalSalesResult,
        dailySalesThisWeek,
        currentWeekTotalResult,
        previousMonthSalesResult,
        previousWeekSalesResult,
    ] = await Promise.all([
        // Monthly aggregation
        Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfYear },
                },
            },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                    },
                    totalSales: { $sum: "$totalPriceForCustomer" },
                },
            },
            { $sort: { "_id.month": 1 } },
        ]),

        // All-time total sales
        Order.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$totalPriceForCustomer" },
                },
            },
        ]),

        // Daily sales this week
        Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfWeek },
                },
            },
            {
                $group: {
                    _id: { dayOfWeek: { $dayOfWeek: "$createdAt" } },
                    totalSales: { $sum: "$totalPriceForCustomer" },
                },
            },
        ]),

        // Count of orders this week
        Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfWeek },
                },
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                },
            },
        ]),

        // Total sales for previous month
        Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfPreviousMonth,
                        $lte: endOfPreviousMonth,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalPriceForCustomer" },
                },
            },
        ]),

        // Total sales for previous week
        Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startOfPreviousWeek,
                        $lte: endOfPreviousWeek,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$totalPriceForCustomer" },
                },
            },
        ]),
    ]);

    const totalSalesByMonth = Array(12).fill(0);
    monthlySalesData.forEach(({ _id: { month }, totalSales }) => {
        totalSalesByMonth[month - 1] = totalSales;
    });

    const currentMonthTotal =
        monthlySalesData.find(
            ({ _id }) =>
                _id.year === currentYear &&
                _id.month === currentMonth + 1
        )?.totalSales || 0;

    const previousMonthTotal = previousMonthSalesResult[0]?.totalSales || 0;

    const percentageChange = previousMonthTotal
        ? ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100
        : currentMonthTotal * 100;

    const totalSales = totalSalesResult[0]?.total || 0;

    const dailySalesMap = Array(7).fill(0);
    dailySalesThisWeek.forEach(({ _id: { dayOfWeek }, totalSales }) => {
        dailySalesMap[dayOfWeek - 1] = totalSales;
    });
    const totalSalesByWeek = [...dailySalesMap.slice(1), dailySalesMap[0]];

    const currentWeekTotalSale = totalSalesByWeek.reduce((acc, curr) => acc + curr, 0);
    const currentWeekTotal = currentWeekTotalResult[0]?.count || 0;

    const previousWeekTotalSale = previousWeekSalesResult[0]?.totalSales || 0;

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalSales,
                totalSalesByMonth,
                totalSalesByWeek,
                currentWeekTotalSale,
                previousWeekTotalSale,
                currentWeekTotal,
                currentMonthTotal,
                previousMonthTotal,
                percentageChange: percentageChange.toFixed(2),
            },
            "Sales statistics and percentage change retrieved successfully"
        )
    );
});



const getTotalPlatformRevenue = asyncHandler(async (req, res) => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const allOrders = await Order.find();

    let monthlyRevenue = Array(12).fill(0);
    let weeklyRevenue = Array(7).fill(0); // [Sun, ..., Sat]
    let totalPlatformRevenue = 0;

    for (const order of allOrders) {
        const creatorPrice = await order.calculateTotalPriceForCreator();
        const platformRevenue = order.totalPriceForCustomer - creatorPrice;
        totalPlatformRevenue += platformRevenue;

        const createdAt = new Date(order.createdAt);
        const month = createdAt.getMonth();
        const dayOfWeek = createdAt.getDay();

        if (createdAt >= startOfYear) {
            monthlyRevenue[month] += platformRevenue;
        }

        if (createdAt >= startOfWeek) {
            weeklyRevenue[dayOfWeek] += platformRevenue;
        }
    }

    const totalRevenueByWeek = [...weeklyRevenue.slice(1), weeklyRevenue[0]];
    const currentMonthRevenue = monthlyRevenue[now.getMonth()];
    const previousMonthRevenue = now.getMonth() > 0 ? monthlyRevenue[now.getMonth() - 1] : 0;

    const percentageChange = previousMonthRevenue
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : currentMonthRevenue * 100;

    return res.status(200).json(
        new ApiResponse(200, {
            totalRevenueByMonth: monthlyRevenue,
            totalRevenueByWeek,
            totalPlatformRevenue,
            currentMonthRevenue,
            previousMonthRevenue,
            percentageChange: percentageChange.toFixed(2),
        }, "Platform revenue statistics retrieved successfully")
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

export { getTotalCreators, getTotalUsers, getTotalOrders, recentOrders, getTotalSales, getTotalPlatformRevenue, getTotalUsersForCurrentMonth };
