import express from "express";
import {
    isAdmin,
    isAuthenticated,
} from "../../middlewares/authentication.middleware.js";
import {
    getTotalCreators,
    getTotalOrders,
    getTotalUsers,
} from "../../controllers/admin/adminDashboard.controller.js";

const router = express.Router();

router.get("/total-creators", isAuthenticated, isAdmin, getTotalCreators);
router.get("/total-orders", isAuthenticated, isAdmin, getTotalOrders);
router.get("/total-customers", isAuthenticated, isAdmin, getTotalUsers);

export default router;
