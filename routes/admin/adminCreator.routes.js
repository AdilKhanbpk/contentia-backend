import express from "express";
import {
    createCreator,
    deleteCreator,
    getAllCreators,
    getSingleCreator,
    updateCreator,
} from "../../controllers/admin/adminCreator.controller.js";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(isAuthenticated);

// GET Routes
router.get("/", isAdmin, getAllCreators);
router.get("/:creatorId", isAdmin, getSingleCreator);

// POST Routes
router.post("/", isAdmin, createCreator);

// PATCH Routes
router.patch("/:creatorId", isAdmin, updateCreator);

// DELETE Routes
router.delete("/:creatorId", isAdmin, deleteCreator);

export default router;
