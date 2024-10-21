import express from "express";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/orders.controller.js";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";

const router = express.Router();

router.route("/").post(isAuthenticated, createOrder);
router.route("/").get(isAuthenticated, getOrders);
router.route("/:orderId").get(isAuthenticated, getOrder);
router.route("/:orderId").patch(isAuthenticated, updateOrder);
router.route("/:orderId").delete(isAuthenticated, deleteOrder);

export default router;
