import express from "express";
import {
  isAuthenticated,
  isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrder,
} from "../../controllers/admin/adminOrder.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, isAdmin, createOrder);
router.get("/", isAuthenticated, isAdmin, getOrders);
router.get("/:orderId", isAuthenticated, isAdmin, getOrderById);
router.patch("/:orderId", isAuthenticated, isAdmin, updateOrder);
router.delete("/:orderId", isAuthenticated, isAdmin, deleteOrder);

export default router;
