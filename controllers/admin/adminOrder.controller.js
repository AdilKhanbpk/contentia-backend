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
import BrandModel from "../../models/brand.model.js";
import { uploadMultipleFilesToCloudinary } from "../../utils/Cloudinary.js";
import parasutApiService from "../../utils/parasutApi.service.js";
import sendEmail from "../../utils/email.js";

const createOrder = asyncHandler(async (req, res) => {
    const {
        customer,
        noOfUgc,
        basePrice,
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

    const newOrder = await Order.create({
        orderOwner: customerExists._id,
        assignedCreators: validatedCreators,
        noOfUgc,
        basePrice,
        additionalServices,
        numberOfRequests: validatedCreators.length,
    });

    if (!newOrder) {
        throw new ApiError(500, "Failed to create order");
    }

    // Create customer notification
    const customerNotification =
        notificationTemplates.orderCreationByAdminForCustomer({
            orderTitle: newOrder?.briefContent?.brandTitle,
            targetUsers: [customerExists._id],
            metadata: {
                customerName: customerExists.fullName,
                customerEmail: customerExists.email,
                customerPhoneNumber: customerExists.phoneNumber,
                message: "This is a new order notification",
            },
        });

    // Create creator notifications if there are valid creators
    const creatorNotifications =
        existingCreators.length > 0
            ? existingCreators.map((creator) => {
                return notificationTemplates.creatorApprovalForOrderByAdmin({
                    orderTitle: newOrder?.briefContent?.brandName,
                    targetUsers: [creator._id],
                    metadata: {
                        creatorName: creator.fullName,
                        creatorEmail: creator.email,
                        creatorPhoneNumber: creator.phoneNumber,
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

    // Try to create invoice in Paraşüt automatically
    let invoiceInfo = null;
    let invoiceError = null;

    try {
        if (customerExists && newOrder.totalPriceForCustomer > 0) {
            // Prepare customer information for Paraşüt
            const customerName = customerExists.fullName ||
                                (customerExists.firstName && customerExists.lastName ? `${customerExists.firstName} ${customerExists.lastName}` : null) ||
                                customerExists.firstName ||
                                customerExists.lastName ||
                                customerExists.email?.split('@')[0] ||
                                'Customer';

            const customerInfo = {
                name: customerName,
                email: customerExists.email,
                phone: customerExists.phoneNumber,
                address: customerExists.address,
                city: customerExists.city,
                taxNumber: customerExists.taxNumber,
                taxOffice: customerExists.taxOffice,
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
                `Order #${newOrder._id} - Video İçerik (Admin Created)`
            );

            invoiceInfo = {
                invoiceId: invoice.invoiceId || invoice.id,
                invoiceNumber: invoice.invoiceNumber || invoice.attributes?.invoice_no,
                totalAmount: newOrder.totalPriceForCustomer,
                sharingUrl: invoice.sharingUrl || invoice.attributes?.sharing_preview_url,
                sharingPath: invoice.sharingPath || invoice.attributes?.sharing_preview_path
            };

            console.log('Invoice created automatically for admin order:', newOrder._id, 'Invoice ID:', invoiceInfo.invoiceId);

            // Send simple invoice creation notification
            if (invoiceInfo && customerInfo.email) {
                try {
                    console.log('📧 Sending invoice creation notification...');

                    const emailHTML = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px;">
                                <h1>Contentia</h1>
                                <h2>Invoice Creation Completed</h2>
                            </div>

                            <div style="padding: 20px 0;">
                                <p>Dear ${customerInfo.name},</p>

                                <p>Your invoice has been successfully created and is now ready.</p>

                                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                                    <h3>Invoice Details:</h3>
                                    <p><strong>Order Number:</strong> ${newOrder._id}</p>
                                    <p><strong>Invoice Number:</strong> ${invoiceInfo.invoiceNumber || invoiceInfo.invoiceId}</p>
                                    <p><strong>Total Amount:</strong> ${invoiceInfo.totalAmount} TL</p>
                                </div>

                                <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745;">
                                    <h4 style="margin: 0 0 10px 0; color: #28a745;">📧 Invoice Access:</h4>
                                    <p style="margin: 0;">You will receive a separate email from Paraşüt with a direct link to view and download your invoice. Please check your inbox.</p>
                                </div>


                                <p>Best regards,<br>
                                Contentia Team</p>
                            </div>

                            <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666;">
                                <p>This is an automated email. Please do not reply to this email.</p>
                            </div>
                        </div>
                    `;

                    await sendEmail({
                        email: customerInfo.email,
                        subject: `Invoice Created - Order #${newOrder._id}`,
                        html: emailHTML
                    });

                    console.log('📧 Invoice creation notification sent successfully to:', customerInfo.email);
                } catch (emailError) {
                    console.error('❌ Failed to send invoice creation notification:', emailError.message);
                }
            }
        }
    } catch (error) {
        invoiceError = error.message;
        console.error('Failed to create invoice automatically for admin order:', newOrder._id, error);
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

// const getOrders = asyncHandler(async (req, res) => {
//     const orders = await Order.find()
//         .sort({ createdAt: -1 })
//         .populate({
//             path: "orderOwner",
//             select: "-password",
//         })
//         .populate({
//             path: "associatedBrands",
//             select: "-associatedOrders",
//         })
//         .populate("assignedCreators");

//     return res
//         .status(200)
//         .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
// });

// const getOrderById = asyncHandler(async (req, res) => {
//     const { orderId } = req.params;

//     isValidId(orderId);

//     const order = await Order.findById(orderId)
//         .populate("orderOwner")
//         .populate("assignedCreators");

//     if (!order) {
//         throw new ApiError(404, "Order not found");
//     }

//     return res
//         .status(200)
//         .json(new ApiResponse(200, order, "Order retrieved successfully"));
// });

const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find()
        .sort({ createdAt: -1 })
        .populate({
            path: "orderOwner",
            select: "-password",
        })
        .populate({
            path: "associatedBrands",
            select: "-associatedOrders",
        })
        .populate("assignedCreators")
        .populate({
            path: 'revisions',
            select: 'revisionContent status revisionDate customer',
            populate: {
                path: 'customer',
                select: 'fullName email profilePic'
            }
        });

    return res
        .status(200)
        .json(new ApiResponse(200, orders, "Orders retrieved successfully"));
});

const getOrderById = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    isValidId(orderId);

    const order = await Order.findById(orderId)
        .populate("orderOwner")
        .populate("assignedCreators")
        .populate({
            path: 'revisions',
            select: 'revisionContent status revisionDate customer',
            populate: {
                path: 'customer',
                select: 'fullName email profilePic'
            }
        });

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
        assignedCreators = [],
        orderStatus,
        basePrice,
        paymentStatus,
        contentsDelivered,
        additionalServices,
        preferences,
        briefContent,
        orderQuota,
    } = req.body;

    if (!mongoose.isValidObjectId(orderId)) {
        throw new ApiError(400, "Invalid order ID");
    }

    const existingOrder = await Order.findById(orderId);
    if (!existingOrder) {
        throw new ApiError(404, "Order not found");
    }

    let orderOwnerToHex;
    if (orderOwner) {
        if (!mongoose.isValidObjectId(orderOwner)) {
            throw new ApiError(400, "Invalid order owner ID");
        }
        orderOwnerToHex = new mongoose.Types.ObjectId(orderOwner);
        const customer = await User.findById(orderOwnerToHex);
        if (!customer) {
            throw new ApiError(404, "Order owner not found");
        }
    }

    let validatedCreators = [];
    if (Array.isArray(assignedCreators) && assignedCreators.length > 0) {
        validatedCreators = assignedCreators.map((id) => {
            if (!mongoose.isValidObjectId(id)) {
                throw new ApiError(400, `Invalid creator ID: ${id}`);
            }
            return new mongoose.Types.ObjectId(id);
        });

        const existingCreators = await Creator.find({
            _id: { $in: validatedCreators },
        });
        if (existingCreators.length !== validatedCreators.length) {
            const missingCreators = validatedCreators.filter(
                (id) =>
                    !existingCreators.some((creator) => creator._id.equals(id))
            );
            throw new ApiError(
                404,
                `Some assigned creators were not found: ${missingCreators.join(
                    ", "
                )}`
            );
        }
    }

    let fileUrls = existingOrder.briefContent?.uploadFiles || [];
    let orderFileUrls = existingOrder.uploadFiles || [];
    let brand;

    if (briefContent) {
        if (req.files && req.files["uploadFiles"]) {
            const filePaths = req.files["uploadFiles"].map((file) => file.path);
            const newFileUrls = await uploadMultipleFilesToCloudinary(
                filePaths
            );
            fileUrls = [
                ...fileUrls,
                ...newFileUrls.map((file) => file.secure_url),
            ];
        }

        if (
            briefContent.brandName &&
            typeof briefContent.brandName === "string"
        ) {
            briefContent.brandName = briefContent.brandName.trim();
            brand = await BrandModel.findOne({
                brandName: briefContent.brandName,
            });

            if (!brand) {
                throw new ApiError(400, "Brand not found");
            }
        }
    }

    if (req.files && req.files["uploadFilesToOrder"]) {
        const filePaths = req.files["uploadFilesToOrder"].map(
            (file) => file.path
        );
        const newOrderFileUrls = await uploadMultipleFilesToCloudinary(
            filePaths
        );
        orderFileUrls = [
            ...orderFileUrls,
            ...newOrderFileUrls.map((file) => file.secure_url),
        ];
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
            noOfUgc,
            orderOwner: orderOwnerToHex,
            orderStatus,
            basePrice,
            paymentStatus,
            contentsDelivered,
            additionalServices,
            preferences,
            briefContent: {
                ...briefContent,
                brandName: brand?.brandName,
                uploadFiles: fileUrls,
            },
            orderQuota,
            numberOfRequests: validatedCreators.length,
            assignedCreators: validatedCreators,
            uploadFiles: orderFileUrls,
            associatedBrands: brand?._id,
        },
        { new: true }
    ).populate("orderOwner assignedCreators");

    if (!updatedOrder) {
        throw new ApiError(500, "Failed to update order");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedOrder, "Order updated successfully"));
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
            orderTitle: updatedOrder?.briefContent?.brandName,
            targetUsers: [creator._id],
            metadata: {
                creatorName: creator.fullName,
                creatorEmail: creator.email,
                creatorPhoneNumber: creator.phoneNumber,
                message: "You have been approved for the order",
            },
        });

    // const customerNotification =
    //     notificationTemplates.customerNotificationForOrderAssignedToCreator({
    //         creatorName: creator.fullName,
    //         creatorEmail: creator.email,
    //         creatorPhoneNumber: creator.phoneNumber,
    //         targetUsers: [order.orderOwner],
    //         metadata: {
    //             message: "A creator has been assigned to your order",
    //         },
    //     });

    await Promise.all([
        sendNotification(creatorNotification),
        // sendNotification(customerNotification),
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
        orderTitle: updatedOrder?.briefContent?.brandName,
        targetUsers: [creator._id],
        metadata: {
            creatorName: creator.fullName,
            creatorEmail: creator.email,
            creatorPhoneNumber: creator.phoneNumber,
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

const getAllAssignedOrders = asyncHandler(async (req, res) => {

    const assignedOrders = await Order.find({
        orderStatus: { $in: ["active", "completed"] }
    })
        .sort({ createdAt: -1 })
        .populate({
            path: "assignedCreators",
            select: "fullName email _id",
        })
        .populate({
            path: "associatedBrands",
            select: "-associatedOrders",
        })
        .populate({
            path: "orderOwner",
            select: "fullName email _id",
        });

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                assignedOrders,
                "Assigned orders retrieved successfully"
            )
        );
});

const adminMarkAsCompleted = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }
    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus: "completed" },
        { new: true }
    );
    if (!updatedOrder) {
        throw new ApiError(500, "Failed to update order");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, updatedOrder, "Order marked as completed by admin successfully"));
});

const adminMarkAsRejected = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }
    const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus: "rejected" },
        { new: true }
    );
    if (!updatedOrder) {
        throw new ApiError(500, "Failed to update order");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, updatedOrder, "Order mark as rejected by admin successfully"));
});

const getCreatorAssignedOrders = asyncHandler(async (req, res) => {
    const { creatorId } = req.params
    isValidId(creatorId)

    const creator = await Creator.findById(creatorId);
    if (!creator) {
        throw new ApiError(404, "Creator not found");
    }

    const orders = await Order.find({
        assignedOrders: creatorId
    })

    return res.status(200).json(new ApiResponse(200, orders, "Creator's Assigned orders retrieved successfully"))

})

export {
    createOrder,
    getOrders,
    getOrderById,
    updateOrder,
    deleteOrder,
    approveCreatorOnOrder,
    rejectCreatorOnOrder,
    getAppliedCreatorsOnOrders,
    getAllAssignedOrders,
    getCreatorAssignedOrders,
    adminMarkAsCompleted,
    adminMarkAsRejected
};
