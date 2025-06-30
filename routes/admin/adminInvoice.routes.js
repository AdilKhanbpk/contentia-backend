import express from "express";
import {
    createSimpleInvoice,
    createDetailedInvoice,
    createInvoiceFromOrder
} from "../../controllers/admin/adminInvoice.controller.js";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated, isAdmin);

// POST Routes
router.post("/simple", createSimpleInvoice);
router.post("/detailed", createDetailedInvoice);
router.post("/from-order/:orderId", createInvoiceFromOrder);

export default router;
