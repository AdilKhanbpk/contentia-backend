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

// Protect all routes
router.use(isAuthenticated);

router.post("/", isAuthenticated, isAdmin, createCreator);
router.get("/", isAuthenticated, isAdmin, getAllCreators);
router.get("/:creatorId", isA8uthenticated, isAdmin, getSingleCreator);
router.patch("/:creatorId", isAuthenticated, isAdmin, updateCreator);
router.delete("/:creatorId", isAuthenticated, isAdmin, deleteCreator);

export default router;
