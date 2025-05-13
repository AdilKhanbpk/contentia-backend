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
            console.error("Error in asyncHandler:", error);

            // Handle MongoDB duplicate key error (code 11000)
            if (error.code === 11000) {
                const duplicateField = Object.keys(error.keyPattern)[0];
                const errorMessage = `Duplicate value for ${duplicateField}. This ${duplicateField} is already in use.`;

                return res.status(409).json({
                    message: errorMessage,
                    success: false,
                    ...(process.env.NODE_ENV === "development" && {
                        details: error.keyValue,
                        stack: error.stack,
                    }),
                });
            }

            // For other errors, use the provided status code or default to 500
            let statusCode = 500;

            // Only use the error.code as status if it's a valid HTTP status code (100-599)
            if (error.statusCode && error.statusCode >= 100 && error.statusCode < 600) {
                statusCode = error.statusCode;
            }

            const response = {
                message: error.message || "Something went wrong",
                success: false,
                ...(process.env.NODE_ENV === "development" && {
                    details: error.details,
                    stack: error.stack,
                }),
            };

            res.status(statusCode).json(response);
        }
    };
};

export default asyncHandler;
