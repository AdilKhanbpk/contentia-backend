import express from "express";
import {
  createCreator,
  createCustomer,
  deleteCreator,
  deleteCustomer,
  getAllCreators,
  getAllCustomers,
  getSingleCreator,
  getSingleCustomer,
  updateCreator,
  updateCustomer,
} from "../../controllers/admin/adminUser.controller.js";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";

const router = express.Router();

// Protect all routes
router.use(isAuthenticated);

// Customer routes
router.post("/customers", createCustomer);
router.get("/customers", getAllCustomers);
router.get("/customers/:id", getSingleCustomer);
router.put("/customers/:id", updateCustomer);
router.delete("/customers/:id", deleteCustomer);

// Creator routes
router.post("/creators", createCreator);
router.get("/creators", getAllCreators);
router.get("/creators/:id", getSingleCreator);
router.put("/creators/:id", updateCreator);
router.delete("/creators/:id", deleteCreator);

export default router;
