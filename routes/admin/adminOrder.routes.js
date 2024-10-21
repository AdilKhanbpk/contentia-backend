import express from "express";
import { protect } from "../../controllers/auth.controller.js";
import {
  createOrder,
  deleteOrder,
  getOrderById,
  getOrders,
  updateOrder,
} from "../../controllers/admin/adminOrder.controller.js";

const router = express.Router();

router.post("/", protect, createOrder);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);
router.put("/:id", protect, updateOrder);
router.delete("/:id", protect, deleteOrder);

export default router;
