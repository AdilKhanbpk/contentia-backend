import express from "express";
import {
    createOrder,
    getOrders,
    getOrder,
    updateOrder,
    deleteOrder,
    createClaimOnOrder,
    getMyOrders,
} from "../controllers/orders.controller.js";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";
import { uploadOnMulter } from "../middlewares/multer.middleware.js";

const router = express.Router();

// GET Routes
router.get("/", isAuthenticated, getOrders);
router.get("/my-orders", isAuthenticated, getMyOrders);
router.get("/:orderId", isAuthenticated, getOrder);

// POST Routes
router.post(
    "/",
    isAuthenticated,
    uploadOnMulter.fields([{ name: "uploadFiles" }]),
    createOrder
);
router.post("/create-claim/:orderId", isAuthenticated, createClaimOnOrder);

// PATCH Routes
router.patch(
    "/:orderId",
    isAuthenticated,
    uploadOnMulter.fields([{ name: "uploadFiles" }]),
    updateOrder
);

// DELETE Routes
router.delete("/:orderId", isAuthenticated, deleteOrder);

export default router;
