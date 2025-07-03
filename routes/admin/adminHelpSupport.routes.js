import express from "express";
import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
    createHelpSupport,
    deleteHelpSupport,
    getHelpSupportById,
    getHelpSupports,
    updateHelpSupport,
} from "../../controllers/admin/adminHelpSupport.controller.js";
import { uploadOnMulter } from "../../middlewares/multer.middleware.js";

const router = express.Router();


// GET Routes
router.get("/", getHelpSupports);
router.get("/:helpSupportId", getHelpSupportById);

// POST Routes
router.post("/", isAuthenticated, isAdmin, uploadOnMulter.single("icon"), createHelpSupport);

// PATCH Routes
router.patch(
    "/:helpSupportId",
    isAuthenticated,
    isAdmin,
    uploadOnMulter.single("icon"),
    updateHelpSupport);

// DELETE Routes
router.delete("/:helpSupportId", isAuthenticated, isAdmin, deleteHelpSupport);

export default router;
