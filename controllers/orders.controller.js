import Orders from "../models/orders.model.js";
import Claims from "../models/admin/adminClaims.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import { isValidId } from "../utils/commonHelpers.js";
import BrandModel from "../models/brand.model.js";
import { uploadMultipleFilesToCloudinary } from "../utils/Cloudinary.js";
import { sendNotification } from "./admin/adminNotification.controller.js";
import User from "../models/user.model.js";
import { notificationTemplates } from "../helpers/notificationTemplates.js";

const createOrder = asyncHandler(async (req, res) => {
    const {
        noOfUgc,
        totalPrice,
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
        !("platform" in additionalServices) ||
        !("duration" in additionalServices) ||
        !("edit" in additionalServices) ||
        !("aspectRatio" in additionalServices)
    ) {
        throw new ApiError(400, "Please provide all additional services");
    }

    let fileUrls = [];
    let brand;
    if (briefContent) {
        if (req.files && req.files["briefContent.uploadFiles"]) {
            const filePaths = req.files["briefContent.uploadFiles"].map(
                (file) => file.path
            );
            fileUrls = await uploadMultipleFilesToCloudinary(filePaths);
        }

        if (briefContent.brandName) {
            briefContent.brandName = briefContent?.brandName.trim();
            brand = await BrandModel.findOne({
                brandName: briefContent?.brandName,
            });

            if (!brand) {
                throw new ApiError(400, "Brand not found");
            }
        }
    }

    const allAdminIds = await User.find({ role: "admin" }).select("_id");

    const notificationData = notificationTemplates.orderCreationByCustomer({
        customerName: req.user.fullName,
        customerEmail: req.user.email,
        customerPhoneNumber: req.user.phoneNumber,
        targetUsers: allAdminIds,
        metadata: {
            status: `The order has been in ${orderStatus} status`,
        },
    });

    console.log("🚀 ~ createOrder ~ notificationData:", notificationData);
    await sendNotification(notificationData);

    const newOrder = await Orders.create({
        orderOwner: req.user._id,
        noOfUgc,
        totalPrice,
        orderStatus,
        paymentStatus,
        contentsDelivered,
        additionalServices,
        preferences,
        briefContent: {
            ...briefContent,
            brandName: brand?.brandName,
            uploadFiles: fileUrls?.map((file) => file.secure_url),
        },
        orderQuota,
        numberOfRequests,
        associatedBrands: brand?._id,
    });

    brand.associatedOrders.push(newOrder._id);
    await brand.save();

    return res
        .status(201)
        .json(new ApiResponse(201, newOrder, "Order created successfully"));
});

const getMyOrders = asyncHandler(async (req, res) => {
    const orders = await Orders.find({ orderOwner: req.user._id })
        .populate({
            path: "orderOwner",
            select: "-password",
        })
        .sort({ createdAt: -1 });

    if (!orders) {
        throw new ApiError(404, "No orders found");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "My Orders retrieved successfully"));
});

const getOrders = asyncHandler(async (req, res) => {
    const creatorId = req.user._id;
    const orders = await Orders.find({
        appliedCreators: { $nin: [creatorId] },
        assignedCreators: { $nin: [creatorId] },
        rejectedCreators: { $nin: [creatorId] },
    })
        .sort({ createdAt: -1 })
        .populate({
            path: "orderOwner",
            select: "-password",
        })
        .populate({
            path: "associatedBrands",
            select: "-associatedOrders",
        });

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
        noOfUgc,
        orderOwner,
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

    const order = await Orders.findByIdAndUpdate(
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
            numberOfRequests,
            uploadFiles,
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

    isValidId(orderId);
    const order = await Orders.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    if (order.briefContent.brandName) {
        const brand = await BrandModel.findOne({
            brandName: order.briefContent.brandName,
        });

        if (brand) {
            brand.associatedOrders = brand.associatedOrders.filter(
                (order) => order.toString() !== orderId
            );
            await brand.save();
        }
    }

    await Orders.findByIdAndDelete(orderId);

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order deleted successfully"));
});

const createClaimOnOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { claimContent } = req.body;

    isValidId(orderId);

    if (!claimContent) {
        throw new ApiError(400, "Please provide claim content");
    }

    const order = await Orders.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const notificationData = notificationTemplates.reportAnOrderFromCustomer({
        customerName: req.user.fullName,
        customerEmail: req.user.email,
        customerPhoneNumber: req.user.phoneNumber,
        targetUsers: [order.orderOwner],
        metadata: {
            status: `The order has been in ${order.orderStatus} status`,
        },
    });

    await sendNotification(notificationData);

    const claim = await Claims.create({
        customer: req.user._id,
        order: orderId,
        claimContent,
    });

    order.orderStatus = "revision";
    await order.save();

    return res
        .status(200)
        .json(new ApiResponse(200, claim, "Order retrieved successfully"));
});

export {
    createOrder,
    updateOrder,
    deleteOrder,
    getOrder,
    getMyOrders,
    getOrders,
    createClaimOnOrder,
};
