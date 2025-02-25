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
    updateHelpSupportIcon,
} from "../../controllers/admin/adminHelpSupport.controller.js";
import { uploadOnMulter } from "../../middlewares/multer.middleware.js";

const router = express.Router();

// Apply authentication globally
router.use(isAuthenticated);

// GET Routes
router.get("/", getHelpSupports);
router.get("/:helpSupportId", isAdmin, getHelpSupportById);

// POST Routes
router.post("/", isAdmin, uploadOnMulter.single("icon"), createHelpSupport);

// PATCH Routes
router.patch("/:helpSupportId", updateHelpSupport);
router.patch(
    "/:helpSupportId/change-icon",
    isAdmin,
    uploadOnMulter.single("icon"),
    updateHelpSupportIcon
);

// DELETE Routes
router.delete("/:helpSupportId", isAdmin, deleteHelpSupport);

export default router;
