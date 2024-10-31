import path from "path";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from "url";

import userAuthRoutes from "./routes/user.routes.js";
import ordersRoute from "./routes/orders.routes.js";
import becomeCreatorRoute from "./routes/creator.routes.js";
import brandRoute from "./routes/brand.routes.js";

// ADMIN ROUTES
import adminCustomerRoutes from "./routes/admin/adminCustomer.routes.js";
import adminCreatorRoutes from "./routes/admin/adminCreator.routes.js";
import adminCustomPackage from "./routes/admin/adminCustomPackage.routes.js";
import adminBannerRoute from "./routes/admin/adminBanner.routes.js";
import adminAboutRoute from "./routes/admin/adminAbout.routes.js";
import adminBlogRoute from "./routes/admin/adminBlog.routes.js";
import adminCouponRoute from "./routes/admin/adminCoupon.routes.js";
import adminFaqRoute from "./routes/admin/adminFaq.routes.js";
import adminHelpSupportRoute from "./routes/admin/adminHelpSupport.routes.js";
import adminHowItWorksRoute from "./routes/admin/adminHowItWorks.routes.js";
import adminOrderRoute from "./routes/admin/adminOrder.routes.js";
import adminPricingRoute from "./routes/admin/adminPricing.routes.js";
import adminAdditionalServiceRoute from "./routes/admin/adminAdditionalService.routes.js";
import adminClaimsRoute from "./routes/admin/adminClaim.routes.js";
import adminNotificationRoute from "./routes/admin/adminNotification.routes.js";
import adminEmailNotificationRoute from "./routes/admin/adminEmailNotification.routes.js";

import ApiError from "./utils/ApiError.js";

const app = express();

const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
  allowedHeaders: "X-Requested-With, Content-Type, Authorization",
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(cookieParser());

// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "")));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use("/api/v1/users", userAuthRoutes);
app.use("/api/v1/orders", ordersRoute);
app.use("/api/v1/become-creator", becomeCreatorRoute);
app.use("/api/v1/brands", brandRoute);

// ADMIN ROUTES
app.use("/api/v1/admin/customer", adminCustomerRoutes);
app.use("/api/v1/admin/creator", adminCreatorRoutes);
app.use("/api/v1/admin/packages", adminCustomPackage);
app.use("/api/v1/admin/faq", adminFaqRoute);
app.use("/api/v1/admin/banner", adminBannerRoute);
app.use("/api/v1/admin/howItWorks", adminHowItWorksRoute);
app.use("/api/v1/admin/about", adminAboutRoute);
app.use("/api/v1/admin/blogs", adminBlogRoute);
app.use("/api/v1/admin/coupons", adminCouponRoute);
app.use("/api/v1/admin/helpSupport", adminHelpSupportRoute);
app.use("/api/v1/admin/order", adminOrderRoute);
app.use("/api/v1/admin/pricing", adminPricingRoute);
app.use("/api/v1/admin/additionalServices", adminAdditionalServiceRoute);
app.use("/api/v1/admin/claims", adminClaimsRoute);
app.use("/api/v1/admin/notifications", adminNotificationRoute);
app.use("/api/v1/admin/emailNotifications", adminEmailNotificationRoute);

app.all("*", (req, res) => {
  const message = `Can't find ${req.originalUrl} on this server!`;
  throw new ApiError(404, message);
});

export default app;
