import express from "express";
import {
  createCustomer,
  updateCustomer,
  getCustomers,
  getCustomerById,
  deleteCustomer,
} from "../../controllers/admin/adminCustomers.controller.js";
import {
  isAuthenticated,
  isAdmin,
} from "../../middlewares/authentication.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.post("/", isAuthenticated, isAdmin, createCustomer);
router.patch("/:customerId", isAuthenticated, isAdmin, updateCustomer);
router.get("/", isAuthenticated, isAdmin, getCustomers);
router.get("/:customerId", isAuthenticated, isAdmin, getCustomerById);
router.delete("/:customerId", isAuthenticated, isAdmin, deleteCustomer);

export default router;
