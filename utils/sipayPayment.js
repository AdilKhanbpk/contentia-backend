// utils/sipayPayment.js
const axios = require('axios');
require('dotenv').config();

const getSipayToken = async () => {
  try {
    const response = await axios.post(`${process.env.SIPAY_BASE_URI}/token`, {
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

const processSipayPayment = async (paymentData) => {
  try {
    const tokenData = await getSipayToken(); // Get token first

    const response = await axios.post(`${process.env.SIPAY_BASE_URI}/payment`, {
      merchant_id: process.env.SIPAY_MERCHANT_ID,
      amount: paymentData.amount,
      currency: 'TRY',
      card_number: paymentData.cardNumber,
      expire_month: paymentData.expireMonth,
      expire_year: paymentData.expireYear,
      cvv: paymentData.cvv,
      buyer: {
        name: paymentData.name,
        email: paymentData.email,
      },
      token: tokenData.token, // Include the token in the payment request
    });

    console.log('Sipay Payment Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error processing Sipay payment:', error.response ? error.response.data : error.message);
    throw new Error('Payment failed');
  }
};

module.exports = {
  processSipayPayment,
};
