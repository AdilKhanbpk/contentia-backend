import express from "express";
import {
  createCustomer,
  updateCustomer,
  getCustomers,
  getCustomerById,
  deleteCustomer,
} from "../../controllers/admin/adminCustomers.controller.js";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";

const router = express.Router();

router.use(isAuthenticated);

router.post("/", isAuthenticated, createCustomer);
router.patch("/:customerId", isAuthenticated, updateCustomer);
router.get("/", isAuthenticated, getCustomers);
router.get("/:customerId", isAuthenticated, getCustomerById);
router.delete("/:customerId", isAuthenticated, deleteCustomer);

export default router;
