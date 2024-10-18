const path = require("path");
const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");
const { cashoutToBank } = require("./utils/cashoutService");

const globalErrorHandler = require("./controllers/error.controller");
const userAuthRoutes = require("./routes/userAuth.routes");
const videoOptionRoutes = require("./routes/videoOption.routes");
const sipayPaymentRoute = require("./routes/sipayPayment.routes");
const ugcBriefRoute = require("./routes/ugcBrief.routes");
const preferencesRoute = require("./routes/preferences.routes");
const ordersProfileRoute = require("./routes/ordersProfile.routes");
const cashoutToBankRoute = require("./routes/cashoutToBank.routes");
const becomeCreatorRoute = require("./routes/becomeCreator.routes");
const adminUserRoutes = require("./routes/admin/adminUser.routes");
const adminCustomPackage = require("./routes/admin/adminCustomPackage.routes");

const cors = require("cors");
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
app.use("/api/v1/sipay", sipayPaymentRoute);
app.use("/api/v1/cashout", cashoutToBankRoute);
app.use("/api/v1/become-creator", becomeCreatorRoute);
app.use("/api/v1/admin/users", adminUserRoutes);
app.use("/api/v1/admin/packages", adminCustomPackage);

app.all("*", (req, res, next) => {
  const message = `Can't find ${req.originalUrl} on this server!`;
  next(new AppError(message, 404));
});
app.use(globalErrorHandler);

module.exports = app;
