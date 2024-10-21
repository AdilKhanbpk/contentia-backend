import express from "express";
import { isAuthenticated } from "../../middlewares/authentication.middleware.js";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrder,
} from "../../controllers/admin/adminOrder.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, createOrder);
router.get("/", isAuthenticated, getOrders);
router.get("/:id", isAuthenticated, getOrderById);
router.put("/:id", isAuthenticated, updateOrder);
router.delete("/:id", isAuthenticated, deleteOrder);

export default router;
