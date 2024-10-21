import path from "path";
import express from "express";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import cookieParser from "cookie-parser";
import cors from "cors";
import { fileURLToPath } from "url";

import userAuthRoutes from "./routes/userAuth.routes.js";
import videoOptionRoutes from "./routes/videoOption.routes.js";
import ugcBriefRoute from "./routes/ugcBrief.routes.js";
import preferencesRoute from "./routes/preferences.routes.js";
import ordersProfileRoute from "./routes/ordersProfile.routes.js";
import becomeCreatorRoute from "./routes/becomeCreator.routes.js";

// ADMIN ROUTES
import adminUserRoutes from "./routes/admin/adminUser.routes.js";
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

// Use __dirname as needed
app.use(express.static(path.join(__dirname, "")));
app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour!",
});

app.use("/api", limiter);
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use("/api/v1/users", userAuthRoutes);
app.use("/api/v1/videos", videoOptionRoutes);
app.use("/api/v1/ugc", ugcBriefRoute);
app.use("/api/v1/preferences", preferencesRoute);
app.use("/api/v1/profile", ordersProfileRoute);
app.use("/api/v1/become-creator", becomeCreatorRoute);

// ADMIN ROUTES
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/admin/packages", adminCustomPackage);
app.use("/api/v1/admin/faq", adminFaqRoute);
app.use("/api/v1/admin/banner", adminBannerRoute);
app.use("/api/v1/admin/howItWorks", adminHowItWorksRoute);
app.use("/api/v1/admin/about", adminAboutRoute);
app.use("/api/v1/admin/blog", adminBlogRoute);
app.use("/api/v1/admin/coupon", adminCouponRoute);
app.use("/api/v1/admin/helpSupport", adminHelpSupportRoute);
app.use("/api/v1/admin/order", adminOrderRoute);
app.use("/api/v1/admin/pricing", adminPricingRoute);
app.use("/api/v1/admin/additionalServices", adminAdditionalServiceRoute);

app.all("*", (req, res) => {
  const message = `Can't find ${req.originalUrl} on this server!`;
  throw new ApiError(404, message);
});

export default app;
