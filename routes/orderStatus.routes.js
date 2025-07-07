import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Orders from "../models/orders.model.js";

const router = Router();

// Get order status including invoice processing status
const getOrderStatus = asyncHandler(async (req, res) => {
    const { orderId } = req.params;

    const order = await Orders.findById(orderId);
    
    if (!order) {
        return res.status(404).json(new ApiResponse(404, null, "Order not found"));
    }

    const response = {
        orderId: order._id,
        orderStatus: order.status,
        invoiceInfo: order.invoiceInfo || {
            status: "processing",
            message: "Invoice is being processed"
        },
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
    };

    // Add helpful messages based on status
    let message = "Order found";
    if (order.invoiceInfo?.status === "processing") {
        message = "Order created - invoice is being processed";
    } else if (order.invoiceInfo?.status === "completed") {
        message = "Order and invoice completed successfully";
    } else if (order.invoiceInfo?.status === "failed") {
        message = "Order created but invoice processing failed";
    }

    return res.status(200).json(new ApiResponse(200, response, message));
});

router.get("/status/:orderId", getOrderStatus);

export default router;
