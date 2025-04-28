import express from "express";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";
import { getCreatorsFiles, getSingleOrderFiles } from "../../controllers/admin/adminFiles.controller.js";


const router = express.Router();

// Apply authentication globally
router.use(isAuthenticated);

// GET Routes
router.get("/", isAdmin, getCreatorsFiles);
router.get("/single-order-files/:orderId", getSingleOrderFiles);

// POST Route

// PATCH Route

// DELETE Route

export default router;
