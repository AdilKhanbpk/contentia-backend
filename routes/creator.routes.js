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
    getAllMyFavoriteOrders,
    totalAppliedAndAssignedOrders,
    totalNumberOfUgcForCompletedOrders,
    totalCompletedOrdersWithShareOption,
    totalAssignedOrders,
    completeTheOrder,
    deleteCreatorAccount,
    getDashboardChartDetails,
} from "../controllers/creator.controller.js";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";
import { uploadOnMulter } from "../middlewares/multer.middleware.js";

const router = express.Router();

// Route to create or update OrdersProfile
router.get("/my-favorite-orders", isAuthenticated, getAllMyFavoriteOrders);
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
    "/add-order-to-favorites/:orderId",
    isAuthenticated,
    addOrderToFavorites
);
router.post(
    "/remove-order-from-favorites/:orderId",
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
router.patch("/complete-order/:orderId", isAuthenticated, completeTheOrder);

router.get(
    "/total-applied-assigned-orders",
    isAuthenticated,
    totalAppliedAndAssignedOrders
);
router.get(
    "/total-ugc-for-completed-orders",
    isAuthenticated,
    totalNumberOfUgcForCompletedOrders
);
router.get(
    "/total-completed-orders-with-share",
    isAuthenticated,
    totalCompletedOrdersWithShareOption
);
router.get("/total-assigned-orders", isAuthenticated, totalAssignedOrders);

router.delete("/", isAuthenticated, deleteCreatorAccount)

router.get("/creator-dashboard-chart", getDashboardChartDetails)
export default router;
