import express from "express";
import {
    createOrder,
    getOrders,
    getOrder,
    updateOrder,
    deleteOrder,
    createClaimOnOrder,
} from "../controllers/orders.controller.js";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";

const router = express.Router();

router.post("/", isAuthenticated, createOrder);
router.get("/", isAuthenticated, getOrders);
router.get("/:orderId", isAuthenticated, getOrder);
router.patch("/:orderId", isAuthenticated, updateOrder);
router.delete("/:orderId", isAuthenticated, deleteOrder);
router.post("/create-claim/:orderId", isAuthenticated, createClaimOnOrder);

export default router;
