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
router.get("/:orderId", isAuthenticated, getOrderById);
router.patch("/:orderId", isAuthenticated, updateOrder);
router.delete("/:orderId", isAuthenticated, deleteOrder);

export default router;
