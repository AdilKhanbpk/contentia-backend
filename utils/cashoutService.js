const axios = require('axios');
const crypto = require('crypto');

/**
 * Generate a secure hash key using AES-256-CBC encryption.
 * @param {number} total - The total amount.
 * @param {number} installment - Number of installments.
 * @param {string} currency_code - The currency code (e.g., TRY).
 * @param {string} merchant_key - The merchant's unique key.
 * @param {string} invoice_id - Unique invoice ID.
 * @param {string} app_secret - The app secret used for encryption.
 * @returns {string} - The generated encrypted hash key.
 */
const generateHashKey = (total, installment, currency_code, merchant_key, invoice_id, app_secret) => {
    const data = `${total}|${installment}|${currency_code}|${merchant_key}|${invoice_id}`;
    const iv = crypto.randomBytes(16); // Properly sized IV for AES-256-CBC
    const password = crypto.createHash('sha256').update(app_secret).digest(); // 32-byte encryption key

    const cipher = crypto.createCipheriv('aes-256-cbc', password, iv);
    let encrypted = cipher.update(data, 'utf8', 'base64');
    encrypted += cipher.final('base64');

    const salt = crypto.randomBytes(2).toString('hex');
    const msg_encrypted_bundle = `${iv.toString('hex')}:${salt}:${encrypted}`.replace(/\//g, '__');
    return msg_encrypted_bundle;
};

/**
 * Get a token from Sipay to be used in API requests.
 * @returns {object} - The token data containing the token and other details.
 */
const getSipayToken = async () => {
    try {
        const tokenUrl = `${process.env.SIPAY_BASE_URI}/api/token`;
        const response = await axios.post(tokenUrl, {
            app_id: process.env.SIPAY_APP_KEY,
            app_secret: process.env.SIPAY_APP_SECRET,
        });

        console.log('Token Response:', response.data);
        return response.data; // Contains the token and is_3d value
    } catch (error) {
        console.error('Error getting token:', error.response ? error.response.data : error.message);
        throw new Error('Failed to retrieve token');
    }
};

/**
 * Perform a cashout request to the bank using the Sipay API.
 * @param {object} cashoutData - The cashout data including recipient bank details and amounts.
 * @returns {object} - The response data from the cashout request.
 */
const cashoutToBank = async (cashoutData) => {
    try {
        const cashoutUrl = `${process.env.SIPAY_BASE_URI}/api/cashout/tobank`;

        console.log('Preparing to send cashout request to Sipay...');

        // Get token first
        const tokenData = await getSipayToken();
        const headers = {
            Authorization: `Bearer ${tokenData.data.token}`,
            'Content-Type': 'application/json',
        };

        // Example values for hash key generation (replace with actual values)
        const total = 1000; // Example amount
        const installment = 1; // Example installment
        const currency_code = "TRY";
        const merchant_key = process.env.SIPAY_MERCHANT_ID;
        const invoice_id = "123456"; // Unique invoice ID
        const app_secret = process.env.SIPAY_APP_SECRET;

        // Generate the hash key
        const hash_key = generateHashKey(total, installment, currency_code, merchant_key, invoice_id, app_secret);
        console.log('Generated Hash Key:', hash_key);

        const requestBody = {
            merchant_key: process.env.SIPAY_MERCHANT_ID,
            hash_key: hash_key, // Use the generated hash key
            cashout_type: 1, // 1 means cashout to bank
            cashout_data: cashoutData, // Array of cashout data objects
        };

        console.log('Request body prepared for cashout:', JSON.stringify(requestBody, null, 2));

        // Sending the POST request to the Sipay API
        const response = await axios.post(cashoutUrl, requestBody, { headers });

        console.log('Response received from Sipay:', JSON.stringify(response.data, null, 2));

        if (response.data && response.data.status_code === 100) {
            console.log('Cashout to bank processed successfully.');
        } else {
            console.error('Cashout to bank failed with error:', response.data);
        }

        return response.data;
    } catch (error) {
        if (error.response) {
            console.error('Cashout to bank error response:', {
                status: error.response.status,
                headers: error.response.headers,
                data: error.response.data,
            });
        } else {
            console.error('Error in making cashout to bank request:', error.message);
        }
        throw new Error('Failed to process cashout to bank request.');
    }
};

module.exports = { cashoutToBank };
