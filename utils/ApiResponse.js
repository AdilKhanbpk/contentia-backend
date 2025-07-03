class ApiResponse {
    /**
     * Standardized API response structure.
     *
     * @param {number} statusCode - The HTTP status code to be sent in the response (e.g., 200 for success, 400 for bad request).
     * @param {*} data - The payload or data to be returned with the response.
     * @param {string} [message="Success"] - A human-readable message describing the response.
     */
    constructor(statusCode, data, message = "Success") {
        this.statusCode = statusCode; // The HTTP status code.
        this.data = data; // The actual response data or payload.
        this.message = message; // A descriptive message, defaults to "Success".
        this.success = statusCode < 400; // Boolean indicating success based on the status code (true if < 400).
    }
}

export default ApiResponse;
