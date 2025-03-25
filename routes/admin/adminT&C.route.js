import express from "express";
import {
    isAdmin,
    isAuthenticated,
} from "../../middlewares/authentication.middleware.js";
import { createPage, deletePage, getPageBySlug, getPages, updatePage } from "../../controllers/admin/adminT&C.controller.js";

const router = express.Router();

router.get("/", isAuthenticated, getPages);

router.get("/:termId", isAuthenticated, isAdmin, getPageBySlug);

router.post("/", isAuthenticated, isAdmin, createPage);

router.patch("/:termId", isAuthenticated, isAdmin, updatePage);

router.delete("/:termId", isAuthenticated, isAdmin, deletePage);

export default router;
