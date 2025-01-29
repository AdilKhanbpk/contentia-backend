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

router.post(
    "/",
    isAuthenticated,
    uploadOnMulter.fields([{ name: "uploadFiles" }]),
    createOrder
);
router.get("/", isAuthenticated, getOrders);
router.get("/my-orders", isAuthenticated, getMyOrders);
router.get("/:orderId", isAuthenticated, getOrder);
router.patch("/:orderId", isAuthenticated, updateOrder);
router.delete("/:orderId", isAuthenticated, deleteOrder);
router.post("/create-claim/:orderId", isAuthenticated, createClaimOnOrder);

export default router;
