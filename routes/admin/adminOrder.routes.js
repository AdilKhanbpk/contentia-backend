import express from "express";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
    createOrder,
    deleteOrder,
    getAppliedCreatorsOnOrders,
    getOrderById,
    getOrders,
    updateOrder,
    approveCreatorOnOrder,
    rejectCreatorOnOrder,
} from "../../controllers/admin/adminOrder.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, isAdmin, createOrder);
router.get("/", isAuthenticated, isAdmin, getOrders);
router.get("/:orderId", isAuthenticated, isAdmin, getOrderById);
router.patch("/:orderId", isAuthenticated, isAdmin, updateOrder);
router.delete("/:orderId", isAuthenticated, isAdmin, deleteOrder);
router.get(
    "/applied-creators/:orderId",
    isAuthenticated,
    isAdmin,
    getAppliedCreatorsOnOrders
);
router.patch(
    "/approve-creator/:orderId/:creatorId",
    isAuthenticated,
    isAdmin,
    approveCreatorOnOrder
);
router.patch(
    "/reject-creator/:orderId/:creatorId",
    isAuthenticated,
    isAdmin,
    rejectCreatorOnOrder
);

export default router;
