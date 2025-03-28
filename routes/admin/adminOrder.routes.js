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
    getAllAssignedOrders,
    adminMarkAsRejected,
    adminMarkAsCompleted,
    getCreatorAssignedOrders,
} from "../../controllers/admin/adminOrder.controller.js";
import { uploadOnMulter } from "../../middlewares/multer.middleware.js";

const router = express.Router();

// GET Requests
router.get("/", isAuthenticated, isAdmin, getOrders);
router.get("/assigned-orders", isAuthenticated, isAdmin, getAllAssignedOrders);
router.get("/creator-assigned-orders/:creatorId", isAuthenticated, isAdmin, getCreatorAssignedOrders);
router.get("/:orderId", isAuthenticated, isAdmin, getOrderById);
router.get(
    "/applied-creators/:orderId",
    isAuthenticated,
    isAdmin,
    getAppliedCreatorsOnOrders
);

// POST Requests
router.post("/", isAuthenticated, isAdmin, createOrder);

// PATCH Requests
router.patch(
    "/:orderId",
    isAuthenticated,
    isAdmin,
    uploadOnMulter.fields([
        { name: "uploadFiles" },
        { name: "uploadFilesToOrder" },
    ]),
    updateOrder
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
router.patch(
    "/mark-as-completed/:orderId",
    isAuthenticated,
    isAdmin,
    adminMarkAsCompleted,
)
router.patch(
    "/mark-as-rejected/:orderId",
    isAuthenticated,
    isAdmin,
    adminMarkAsRejected
)

// DELETE Requests
router.delete("/:orderId", isAuthenticated, isAdmin, deleteOrder);

export default router;
