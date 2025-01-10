import express from "express";
import {
    changePassword,
    createCreator,
    loginCreator,
    updateCreator,
    applyForOrder,
    getAllAppliedOrders,
    myAssignedOrders,
    myRejectedOrders,
    changeProfilePicture,
    uploadContentToOrder,
    getNotifications,
    addOrderToFavorites,
    removeOrderFromFavorites,
    getMyOrderFolderToUploadContent,
} from "../controllers/creator.controller.js";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";
import { uploadOnMulter } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Route to create or update OrdersProfile
router.get("/my-applied-orders", isAuthenticated, getAllAppliedOrders);
router.get("/my-rejected-orders", isAuthenticated, myRejectedOrders);
router.get("/my-assigned-orders", isAuthenticated, myAssignedOrders);
router.get("/get-notifications", isAuthenticated, getNotifications);
router.get(
    "/:creatorId/get-my-order-folder-to-upload-content",
    isAuthenticated,
    getMyOrderFolderToUploadContent
);

router.post("/create", createCreator);
router.post("/login", loginCreator);
router.post(
    "/upload-content-to-order/:orderId",
    isAuthenticated,
    uploadOnMulter.array("uploadFiles"),
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
    "/change-profilePicture",
    isAuthenticated,
    uploadOnMulter.single("profilePic"),
    changeProfilePicture
);
router.post("/apply-for-order/:orderId", isAuthenticated, applyForOrder);

export default router;
