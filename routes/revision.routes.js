import express from "express";
import {
    isAuthenticated,
    isAdmin,
} from "../middlewares/authentication.middleware.js";
import {
    createRevision,
    deleteRevision,
    getRevisionById,
    getRevisions, 
    updateRevision,
} from "../controllers/revision.controller.js";

const router = express.Router();

// GET Routes
router.get("/", isAuthenticated, getRevisions);
router.get("/:revisionId", isAuthenticated, getRevisionById);

// POST Routes
router.post("/create-revision/:orderId", isAuthenticated, createRevision);

// PATCH Routes
router.patch("/:revisionId", isAuthenticated, updateRevision);

// DELETE Routes
router.delete("/:revisionId", isAuthenticated, deleteRevision);

export default router;
