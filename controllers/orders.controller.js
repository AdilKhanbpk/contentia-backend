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
import Revision from "../models/revision.model.js";
import parasutApiService from "../utils/parasutApi.service.js";

const createOrder = asyncHandler(async (req, res) => {
    let {
        noOfUgc,
        totalPrice,
        basePrice = 100, // Default base price of 100 TL per video
        orderStatus = "pending",
        paymentStatus = "pending",
        contentsDelivered = 0,
        additionalServices,
        preferences,
        briefContent,
        orderQuota,
        numberOfRequests,
    } = req.body;

    // Calculate total price if not provided
    if (!totalPrice && noOfUgc) {
        totalPrice = basePrice * noOfUgc;
    }

    // Provide default values for additionalServices if not provided or incomplete
    if (!additionalServices) {
        additionalServices = {};
    }

    // Set default values for required fields if they don't exist
    if (!("platform" in additionalServices)) {
        additionalServices.platform = "Instagram";
    }

    if (!("duration" in additionalServices)) {
        additionalServices.duration = "30s";
    }

    if (!("edit" in additionalServices)) {
        additionalServices.edit = true;
    }

    if (!("aspectRatio" in additionalServices)) {
        additionalServices.aspectRatio = "9:16";
    }

    // Set default values for optional fields if they don't exist
    if (!("share" in additionalServices)) {
        additionalServices.share = false;
    }

    if (!("coverPicture" in additionalServices)) {
        additionalServices.coverPicture = false;
    }

    if (!("creatorType" in additionalServices)) {
        additionalServices.creatorType = false;
    }

    if (!("productShipping" in additionalServices)) {
        additionalServices.productShipping = false;
    }

    let fileUrls = [];
    let brand;
    if (briefContent) {
        if (req.files && req.files["uploadFiles"]) {
            const filePaths = req.files["uploadFiles"].map((file) => file.path);

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
        targetUsers: allAdminIds,
        metadata: {
            customerName: req.user.fullName || "John Doe",
            customerEmail: req.user.email || "example.com",
            customerPhoneNumber: req.user.phoneNumber || "123456789",
            status: `The order has been in ${orderStatus} status`,
        },
    });

    await sendNotification(notificationData);

    const newOrder = await Orders.create({
        orderOwner: req.user._id,
        noOfUgc,
        totalPrice,
        basePrice,
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

    // Try to create invoice in Paraşüt automatically
    let invoiceInfo = null;
    let invoiceError = null;

    try {
        // Get customer information from the user
        const customer = await User.findById(req.user._id);

        if (customer && newOrder.totalPriceForCustomer > 0) {
            // Prepare customer information for Paraşüt
            const customerName = customer.fullName ||
                                (customer.firstName && customer.lastName ? `${customer.firstName} ${customer.lastName}` : null) ||
                                customer.firstName ||
                                customer.lastName ||
                                customer.email?.split('@')[0] ||
                                'Customer';

            const customerInfo = {
                name: customerName,
                email: customer.email,
                phone: customer.phoneNumber,
                address: customer.address,
                city: customer.city,
                taxNumber: customer.taxNumber,
                taxOffice: customer.taxOffice,
                contactType: 'person'
            };

            // Create complete invoice workflow in Paraşüt (7 steps)
            const paymentInfo = {
                isSuccessful: true, // Assuming payment was successful if we reach this point
                amount: newOrder.totalPriceForCustomer,
                currency: 'TRY',
                date: new Date().toISOString().split('T')[0],
                description: `Payment for Order #${newOrder._id}`
            };

            const invoice = await parasutApiService.createCompleteInvoiceWorkflow(
                customerInfo,
                newOrder,
                paymentInfo,
                `Order #${newOrder._id} - Video Content Services`
            );

            if (invoice.status === 'disabled') {
                console.log('⚠️ Paraşüt integration is disabled - skipping invoice creation');
            } else if (invoice.status === 'access_denied') {
                console.log('⚠️ Paraşüt access denied - skipping invoice creation');
                console.log('💡 Please verify Paraşüt credentials and company ID');
                invoiceError = 'Paraşüt access denied - please verify credentials';
            } else if (invoice.invoiceId) {
                invoiceInfo = {
                    invoiceId: invoice.invoiceId,
                    invoiceNumber: invoice.invoiceNumber,
                    totalAmount: newOrder.totalPriceForCustomer
                };
                console.log('✅ Invoice created automatically for order:', newOrder._id, 'Invoice ID:', invoice.invoiceId);
            } else {
                invoiceInfo = {
                    invoiceId: invoice.id,
                    invoiceNumber: invoice.attributes?.invoice_no,
                    totalAmount: newOrder.totalPriceForCustomer
                };
                console.log('✅ Invoice created automatically for order:', newOrder._id, 'Invoice ID:', invoice.id);
            }
        }
    } catch (error) {
        invoiceError = error.message;
        console.error('Failed to create invoice automatically for order:', newOrder._id, error);
        // Don't fail the order creation if invoice fails
    }

    const responseMessage = invoiceError
        ? `Order created successfully, but invoice creation failed: ${invoiceError}`
        : invoiceInfo
        ? `Order created successfully and invoice generated (${invoiceInfo.invoiceNumber})`
        : "Order created successfully";

    return res
        .status(201)
        .json(new ApiResponse(201, {
            ...newOrder.toObject(),
            invoiceInfo: invoiceInfo,
            invoiceError: invoiceError
        }, responseMessage));
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
        orderStatus: { $nin: ["completed", "revision"] },
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
        orderTitle: order.briefContent.brandName,
        targetUsers: [order.orderOwner],
        metadata: {
            customerName: req.user.fullName,
            customerEmail: req.user.email,
            customerPhoneNumber: req.user.phoneNumber,
            status: `The order has been in ${order.orderStatus} status`,
        },
    });

    await sendNotification(notificationData);

    const claim = await Claims.create({
        customer: order.orderOwner,
        creator: req.user._id,
        order: orderId,
        claimContent,
    });



    return res
        .status(200)
        .json(new ApiResponse(200, claim, "Order retrieved successfully"));
});

const createRevisionOnOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const { revisionContent } = req.body;

    isValidId(orderId);

    if (!revisionContent) {
        throw new ApiError(400, "Please provide revision content");
    }

    const order = await Orders.findById(orderId);

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const notificationData = notificationTemplates.reportAnOrderFromCustomer({
        orderTitle: order.briefContent.brandName,
        targetUsers: [order.orderOwner],
        metadata: {
            customerName: req.user.fullName,
            customerEmail: req.user.email,
            customerPhoneNumber: req.user.phoneNumber,
            status: `The order has been in ${order.orderStatus} status`,
        },
    });

    await sendNotification(notificationData);

    const revision = await Revision.create({
        customer: req.user._id,
        order: orderId,
        revisionContent,
    });

    order.orderStatus = "revision";
    await order.save();

    return res
        .status(200)
        .json(new ApiResponse(200, revision, "Order retrieved successfully"));
})

const approveRevisionOnOrder = asyncHandler(async (req, res) => {
    const { orderId, revisionId } = req.params;

    isValidId(orderId);
    isValidId(revisionId);

    const [order, revision] = await Promise.all([
        Orders.findById(orderId),
        Revision.findById(revisionId)
    ]);

    if (!order) throw new ApiError(404, "Order not found");
    if (!revision) throw new ApiError(404, "Revision not found");

    order.orderStatus = "active";
    revision.status = "approved";

    await Promise.all([
        order.save(),
        revision.save()
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order updated successfully"));
});

const rejectRevisionOnOrder = asyncHandler(async (req, res) => {
    const { orderId, revisionId } = req.params;

    isValidId(orderId);
    isValidId(revisionId);

    const [order, revision] = await Promise.all([
        Orders.findById(orderId),
        Revision.findById(revisionId)
    ]);

    if (!order) throw new ApiError(404, "Order not found");
    if (!revision) throw new ApiError(404, "Revision not found");

    order.orderStatus = "active";
    revision.status = "rejected";

    await Promise.all([
        order.save(),
        revision.save()
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, order, "Order updated successfully"));
});

export {
    createOrder,
    updateOrder,
    deleteOrder,
    getOrder,
    getMyOrders,
    getOrders,
    createClaimOnOrder,
    createRevisionOnOrder,
    approveRevisionOnOrder,
    rejectRevisionOnOrder,
};
