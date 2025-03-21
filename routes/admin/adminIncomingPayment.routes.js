import express from "express";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import { uploadOnMulter } from "../../middlewares/multer.middleware.js";
import { createPayment, deletePayment, getAllPayments, getPaymentById, refundPayment, updatePayment } from "../../controllers/admin/adminIncomingPayments.controller.js";


const router = express.Router();

// GET Routes
router.get("/", isAuthenticated, getAllPayments);
router.get("/:paymentId", isAuthenticated, getPaymentById);

// POST Routes
router.post(
    "/:orderId",
    isAuthenticated,
    uploadOnMulter.single("invoiceImage"),
    createPayment
);

// PATCH Routes
router.patch(
    "/:paymentId",
    isAuthenticated,
    uploadOnMulter.single("invoiceImage"),
    updatePayment
);
router.patch(
    "/refund-payment/:paymentId",
    isAuthenticated,
    refundPayment
);

// DELETE Routes
router.delete("/:id", isAuthenticated, deletePayment);

export default router;
