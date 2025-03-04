import express from "express";
import {
    createCustomer,
    updateCustomer,
    getCustomers,
    getCustomerById,
    deleteCustomer,
    getAdminCustomers,
} from "../../controllers/admin/adminCustomers.controller.js";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated, isAdmin);

// GET Routes
router.get("/", getCustomers);
router.get("/admins", getAdminCustomers);
router.get("/:customerId", getCustomerById);

// POST Routes
router.post("/", createCustomer);

// PATCH Routes
router.patch("/:customerId", updateCustomer);

// DELETE Routes
router.delete("/:customerId", deleteCustomer);

export default router;
