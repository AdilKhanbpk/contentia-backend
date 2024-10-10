const path = require('path');
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const userAuthRoutes = require('./routes/userAuthRoutes/userAuthRoutes');
const videoOptionRoutes = require('./routes/videoOptionRoutes/videoOptionRoutes');
const sipayPaymentRoute = require( './routes/sipayPaymentRoute/sipayPaymentRoute');
const ugcBriefRoute = require('./routes/ugcBriefRoute/ugcBriefRoute');
const preferencesRoute = require('./routes/preferencesRoute/preferencesRoute');

const cors = require('cors');

const app = express();

// Middleware

const corsOptions = {
  origin: 'http://localhost:3000',
  methods: 'GET,POST,PUT,DELETE,OPTIONS',
  allowedHeaders: 'X-Requested-With, Content-Type, Authorization',
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


app.use(cookieParser()); // Ensure you can parse cookies

// 1) GLOBAL MIDDLEWARES
// Serving static files (if needed)
app.use(express.static(path.join(__dirname, '')));

// Set security HTTP headers
app.use(helmet());

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Limit requests from the same API
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('/api', limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
    hpp({
        whitelist: [
            'duration',
            'ratingsQuantity',
            'ratingsAverage',
            'maxGroupSize',
            'difficulty',
            'price',
        ],
    })
);

// Test middleware for request time
app.use((req, res, next) => {
    req.requestTime = new Date().toISOString();
    next();
});

// 3) ROUTES

app.use('/api/v1/users', userAuthRoutes); // Ensure this points to your API routes
app.use('/api/v1/videos', videoOptionRoutes);
app.use('/api/v1/sipay', sipayPaymentRoute);
app.use('/api/v1/ugc', ugcBriefRoute);
app.use('/api/v1/preferences', preferencesRoute);

// Catch-all error handling middleware for unknown routes
app.all('*', (req, res, next) => {
    const message = `Can't find ${req.originalUrl} on this server!`;
    next(new AppError(message, 404));
});

// Error handling middleware
app.use(globalErrorHandler);

module.exports = app;
