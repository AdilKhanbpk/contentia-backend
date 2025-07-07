/**
 * Universal retry utility for handling network requests with exponential backoff
 */

/**
 * Retry a function with exponential backoff
 * @param {Function} fn - Function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {number} options.baseDelay - Base delay in milliseconds (default: 1000)
 * @param {number} options.maxDelay - Maximum delay in milliseconds (default: 30000)
 * @param {Array} options.retryConditions - Array of conditions to retry on
 * @param {string} options.operationName - Name of operation for logging
 * @returns {Promise} - Result of the function or throws error
 */
export async function retryWithBackoff(fn, options = {}) {
    const {
        maxRetries = 3,
        baseDelay = 1000,
        maxDelay = 30000,
        retryConditions = ['ECONNABORTED', 'ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT'],
        operationName = 'Operation'
    } = options;

    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            const result = await fn();
            if (attempt > 0) {
                console.log(`✅ ${operationName} succeeded on attempt ${attempt + 1}`);
            }
            return result;
        } catch (error) {
            lastError = error;

            // Don't retry on the last attempt
            if (attempt === maxRetries) {
                break;
            }

            // Check if we should retry based on error conditions
            const shouldRetry = shouldRetryError(error, retryConditions);
            
            if (!shouldRetry) {
                console.log(`❌ ${operationName} failed with non-retryable error:`, error.message);
                throw error;
            }

            // Calculate delay with exponential backoff
            const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
            
            console.warn(`⚠️ ${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}): ${error.message}`);
            console.warn(`🔄 Retrying in ${delay / 1000} seconds...`);

            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    console.error(`❌ ${operationName} failed after ${maxRetries + 1} attempts`);
    throw lastError;
}

/**
 * Check if an error should trigger a retry
 * @param {Error} error - The error to check
 * @param {Array} retryConditions - Conditions to retry on
 * @returns {boolean} - Whether to retry
 */
function shouldRetryError(error, retryConditions) {
    // Network/timeout errors
    if (error.code && retryConditions.includes(error.code)) {
        return true;
    }

    // HTTP status codes that should be retried
    if (error.response) {
        const status = error.response.status;
        const retryableStatuses = [408, 429, 500, 502, 503, 504];
        return retryableStatuses.includes(status);
    }

    // Axios timeout errors
    if (error.message && error.message.includes('timeout')) {
        return true;
    }

    return false;
}

/**
 * Retry specifically for API requests
 * @param {Function} apiCall - API call function
 * @param {string} operationName - Name for logging
 * @returns {Promise} - API response
 */
export async function retryApiCall(apiCall, operationName = 'API Call') {
    return retryWithBackoff(apiCall, {
        maxRetries: 3,
        baseDelay: 2000, // Start with 2 seconds
        maxDelay: 30000, // Max 30 seconds
        retryConditions: ['ECONNABORTED', 'ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT'],
        operationName
    });
}

/**
 * Retry specifically for SMS sending
 * @param {Function} smsCall - SMS sending function
 * @returns {Promise} - SMS response
 */
export async function retrySmsCall(smsCall) {
    return retryWithBackoff(smsCall, {
        maxRetries: 2, // Fewer retries for SMS
        baseDelay: 3000, // 3 seconds base delay
        maxDelay: 15000, // Max 15 seconds
        retryConditions: ['ECONNABORTED', 'ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT'],
        operationName: 'SMS Sending'
    });
}

/**
 * Retry specifically for email sending
 * @param {Function} emailCall - Email sending function
 * @returns {Promise} - Email response
 */
export async function retryEmailCall(emailCall) {
    return retryWithBackoff(emailCall, {
        maxRetries: 2,
        baseDelay: 1000,
        maxDelay: 10000,
        retryConditions: ['ECONNABORTED', 'ENOTFOUND', 'ECONNRESET', 'ETIMEDOUT'],
        operationName: 'Email Sending'
    });
}
