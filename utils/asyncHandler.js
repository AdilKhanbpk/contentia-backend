const asyncHandler = (requestHandler) => {
    /**
     * Middleware to handle asynchronous route handlers, ensuring errors are caught and passed to the next middleware.
     *
     * @param {function} requestHandler - The async function to handle the incoming request, typically a controller function.
     * @returns {function} - A function to wrap the async route handler, catching and passing errors if they occur.
     */
    return async (req, res, next) => {
        try {
            await requestHandler(req, res, next); // Execute the provided request handler.
        } catch (error) {
            const { code = 500, message, details, stack } = error; // Destructure error object, with default code of 500.

            const response = {
                message, // Error message.
                success: false, // Success status is always false for errors.
                // stack: stack, // Stack trace (commented out by default).
                ...(process.env.NODE_ENV === "development" && {
                    details,
                    stack,
                }), // Include stack trace and details if in development mode.
            };


            res.status(code).json(response); // Send the error response with the appropriate status code.
        }
    };
};

export default asyncHandler;
