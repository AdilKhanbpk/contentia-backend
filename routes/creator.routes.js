import express from "express";
import {
    changePassword,
    createCreator,
    loginCreator,
    updateCreator,
    applyForOrder,
    getAllAppliedOrders,
    myAssignedOrders,
    changeProfilePicture,
    uploadContentToOrder,
    getNotifications,
    addOrderToFavorites,
    removeOrderFromFavorites,
    getMyOrderFolderToUploadContent,
} from "../controllers/creator.controller.js";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";

const router = express.Router();

// Route to create or update OrdersProfile
router.get("/:creatorId/applied-orders", isAuthenticated, getAllAppliedOrders);
router.get("/:creatorId/my-assigned-orders", isAuthenticated, myAssignedOrders);
router.get("/:creatorId/get-notifications", isAuthenticated, getNotifications);
router.get(
    "/:creatorId/get-my-order-folder-to-upload-content",
    isAuthenticated,
    getMyOrderFolderToUploadContent
);

router.post("/create", createCreator);
router.post("/login", loginCreator);
router.post(
    "/:creatorId/upload-content-to-order",
    isAuthenticated,
    uploadContentToOrder
);
router.post(
    "/:creatorId/add-order-to-favorites",
    isAuthenticated,
    addOrderToFavorites
);
router.post(
    "/:creatorId/remove-order-from-favorites",
    isAuthenticated,
    removeOrderFromFavorites
);
router.patch("/", isAuthenticated, updateCreator);
router.patch("/:creatorId/change-password", isAuthenticated, changePassword);
router.patch(
    "/:creatorId/change-profilePicture",
    isAuthenticated,
    changeProfilePicture
);
router.post("/:creatorId/apply-for-order", isAuthenticated, applyForOrder);

export default router;
