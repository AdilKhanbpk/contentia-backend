import IncomingPayment from "../../models/admin/adminIncomingPayment.model.js";
import Order from "../../models/orders.model.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { deleteFileFromCloudinary, uploadFileToCloudinary } from "../../utils/Cloudinary.js";
import { isValidId } from "../../utils/commonHelpers.js";

const uploadInvoiceImageToOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    if (!orderId) {
        throw new ApiError(400, "Order ID is required.");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found.");
    }

    const existingPayment = await IncomingPayment.findOne({ orderId });

    if (existingPayment?.invoiceImage) {
        try {
            await deleteFileFromCloudinary(existingPayment.invoiceImage);
        } catch (error) {
            console.error("Failed to delete old image from Cloudinary:", error);
        }
    }

    let uploadedInvoice;
    if (req.file) {
        try {
            uploadedInvoice = await uploadFileToCloudinary(req.file.path);
        } catch (error) {
            throw new ApiError(500, "Error uploading invoice to Cloudinary.");
        }
    }

    let newPayment;
    if (existingPayment) {
        existingPayment.invoiceImage = uploadedInvoice?.secure_url;
        existingPayment.paymentAmount = order?.totalPrice;
        newPayment = await existingPayment.save();
    } else {
        newPayment = await IncomingPayment.create({
            orderId,
            invoiceImage: uploadedInvoice?.secure_url,
            paymentAmount: order?.totalPrice,
        });
    }

    res.status(200).json({
        message: "Invoice image uploaded successfully.",
        payment: newPayment,
    });
});


const createPayment = asyncHandler(async (req, res) => {
    const { paymentStatus, refundStatus, orderId } = req.body

    if (!orderId) {
        throw new ApiError(400, "Order id is required.");
    }

    const order = await Order.findById(orderId)
    if (!order) {
        throw new ApiError(404, "Order Not Found")
    }



    let uploadedInvoice;

    if (req.file) {
        try {
            uploadedInvoice = await uploadFileToCloudinary(req.file.path);
        } catch (error) {
            throw new ApiError(500, "Error uploading invoice to Cloudinary.");
        }
    }

    const newPayment = await IncomingPayment.create({
        orderId,
        paymentStatus,
        refundStatus,
        invoiceImage: uploadedInvoice?.secure_url,
        paymentAmount: order?.totalPrice,
    });

    return res
        .status(201)
        .json(new ApiResponse(201, newPayment, "Payment created successfully"));
});

const getAllPayments = asyncHandler(async (req, res) => {
    const payments = await IncomingPayment.find();
    return res
        .status(200)
        .json(new ApiResponse(200, payments, "Payments retrieved successfully"));
});

const getPaymentById = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    isValidId(paymentId);

    const payment = await IncomingPayment.findById(paymentId);

    if (!payment) {
        throw new ApiError(404, `Payment not found with paymentId: ${paymentId}`);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, payment, "Payment retrieved successfully"));
});

const updatePayment = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    isValidId(paymentId);

    let updateData = { ...req.body };

    if (req.file) {
        try {
            const uploadedInvoice = await uploadFileToCloudinary(req.file.path);
            updateData.invoiceImage = uploadedInvoice?.secure_url;
        } catch (error) {
            throw new ApiError(500, "Error uploading new invoice to Cloudinary.");
        }
    }

    const updatedPayment = await IncomingPayment.findByIdAndUpdate(paymentId, updateData, {
        new: true,
        runValidators: true
    });

    if (!updatedPayment) {
        throw new ApiError(404, `Payment not found with paymentId: ${paymentId}`);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, updatedPayment, "Payment updated successfully"));
});

const deletePayment = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    isValidId(paymentId);

    const deletedPayment = await IncomingPayment.findByIdAndDelete(paymentId);

    if (!deletedPayment) {
        throw new ApiError(404, `Payment not found with paymentId: ${paymentId}`);
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Payment deleted successfully"));
});

const refundPayment = asyncHandler(async (req, res) => {
    const { paymentId } = req.params;
    isValidId(paymentId);

    const payment = await IncomingPayment.findById(paymentId);
    if (!payment) {
        throw new ApiError(404, `Payment not found with paymentId: ${paymentId}`);
    }

    payment.paymentStatus = "refund";
    await payment.save();

    return res
        .status(200)
        .json(new ApiResponse(200, payment, "Payment refunded successfully"));

})

export {
    createPayment,
    uploadInvoiceImageToOrder,
    getAllPayments,
    getPaymentById,
    updatePayment,
    deletePayment,
    refundPayment
};
