import express from "express";
import {
  createCustomer,
  deleteCustomer,
  getAllCustomers,
  getSingleCustomer,
  updateCustomer,
} from "../../controllers/admin/adminCustomers.controller.js";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";

const router = express.Router();

// Protect all routes
router.use(isAuthenticated);

router.post("/customers", isAuthenticated, createCustomer);
router.get("/customers", isAuthenticated, getAllCustomers);
router.get("/customers/:id", isAuthenticated, getSingleCustomer);
router.put("/customers/:id", isAuthenticated, updateCustomer);
router.delete("/customers/:id", isAuthenticated, deleteCustomer);

export default router;
