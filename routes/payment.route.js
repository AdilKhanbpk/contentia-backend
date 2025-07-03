import express from "express";
import {
    isAuthenticated,
} from "../middlewares/authentication.middleware.js";
import { PaymentApi, PaymentApiCallBack } from "../controllers/paytr-payment/DirectPaymentApi.js";


const router = express.Router();


// POST Routes
// router.post("/api/direct-payment", isAuthenticated, createRevision);
router.post("/direct-payment",  PaymentApi);
// router.post("api/paytr/callback", isAuthenticated, createRevision);
router.post("/callback",express.urlencoded({ extended: true }), PaymentApiCallBack);

export default router;
