class ApiError extends Error {
    /**
     * Custom API Error class to handle API-specific errors.
     *
     * @param {number} statusCode - The HTTP status code to be sent in the response (e.g., 400, 404, 500).
     * @param {string} [message="Something went wrong"] - A human-readable error message to describe the error.
     * @param {Array} [errors=[]] - Additional error details or validation errors (optional).
     * @param {string} [stack=""] - The stack trace of the error (optional, mostly for debugging purposes).
     */
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ) {
        super(message);
        this.statusCode = statusCode; // The HTTP status code.
        this.data = null; // Any relevant data for the error, initially set to null.
        this.message = message; // The error message.
        this.success = false; // Indicates the success status, always false for errors.
        this.errors = errors; // Additional error details, if any.

        // Set the stack trace if provided, or capture it automatically.
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;
