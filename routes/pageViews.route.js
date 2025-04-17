import express from "express";
import { isAuthenticated } from "../middlewares/authentication.middleware.js";
import { getPageViews } from "../utils/googlePageView.js";


const router = express.Router();

// GET Routes
router.get("/", isAuthenticated, getPageViews);


export default router;
