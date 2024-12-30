import express from "express";

import {
    isAuthenticated,
    isAdmin,
} from "../../middlewares/authentication.middleware.js";
import {
    createLandingPage,
    getLandingPage,
    updateLandingPage,
} from "../../controllers/admin/adminLandingPage.controller.js";
import { uploadOnMulter } from "../../middlewares/multer.middleware.js";

const router = express.Router();

router.post(
    "/",
    isAuthenticated,
    isAdmin,
    uploadOnMulter.fields([
        { name: "video1", maxCount: 1 },
        { name: "video2", maxCount: 1 },
        { name: "video3", maxCount: 1 },
        { name: "video4", maxCount: 1 },
        { name: "video5", maxCount: 1 },
        { name: "video6", maxCount: 1 },
        { name: "video7", maxCount: 1 },
        { name: "video8", maxCount: 1 },
        { name: "video9", maxCount: 1 },
        { name: "video10", maxCount: 1 },
    ]),
    createLandingPage
);
router.get("/", getLandingPage);
router.patch(
    "/:landingPageId",
    isAuthenticated,
    isAdmin,
    uploadOnMulter.fields([
        { name: "video1", maxCount: 1 },
        { name: "video2", maxCount: 1 },
        { name: "video3", maxCount: 1 },
        { name: "video4", maxCount: 1 },
        { name: "video5", maxCount: 1 },
        { name: "video6", maxCount: 1 },
        { name: "video7", maxCount: 1 },
        { name: "video8", maxCount: 1 },
        { name: "video9", maxCount: 1 },
        { name: "video10", maxCount: 1 },
    ]),
    updateLandingPage
);

export default router;
