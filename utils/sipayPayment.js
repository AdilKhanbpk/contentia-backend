// utils/sipayPayment.js
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const getSipayToken = async () => {
  console.log("SIPAY_APP_KEY:", process.env.SIPAY_APP_KEY);
  console.log("SIPAY_APP_SECRET:", process.env.SIPAY_APP_SECRET);
  console.log("SIPAY_MERCHANT_ID:", process.env.SIPAY_MERCHANT_ID);

  try {
    console.log(
      "Token Request URL:",
      `${process.env.SIPAY_BASE_URI}/api/token`
    );

    const response = await axios.post(
      `${process.env.SIPAY_BASE_URI}/api/token`,
      {
        app_id: process.env.SIPAY_APP_KEY,
        app_secret: process.env.SIPAY_APP_SECRET,
      }
    );

    console.log("Token Response:", response.data);
    return response.data; // Contains the token and is_3d value
  } catch (error) {
    console.error(
      "Error getting token:",
      error.response ? error.response.data : error.message
    );
    if (error.response) {
      console.error(
        "Error Details:",
        error.response.status,
        error.response.data
      );
    } else {
      console.error("Error:", error.message);
    }

    throw new Error("Failed to retrieve token");
  }
};

const processSipayPayment = async (paymentData) => {
  try {
    const tokenData = await getSipayToken(); // Get token first
    // Log the headers before sending the payment request
    const headers = {
      Authorization: `Bearer ${tokenData.data.token}`,
      "Content-Type": "application/json",
    };

    console.log("Headers:", headers);

    console.log(
      "Token Request URL:",
      `${process.env.SIPAY_BASE_URI}/api/commissions`
    );

    const response = await axios.post(
      `${process.env.SIPAY_BASE_URI}/api/commissions`,
      {
        merchant_id: process.env.SIPAY_MERCHANT_ID,
        amount: paymentData.amount,
        currency: "TRY",
        card_number: paymentData.cardNumber,
        expire_month: paymentData.expireMonth,
        expire_year: paymentData.expireYear,
        cvv: paymentData.cvv,
        token: tokenData.data.token, // Include the token in the payment request
      },
      { headers }
    ); // Pass the headers

    console.log("Sipay Payment Response:", response.data);
    return response.data; // Make sure to return this
  } catch (error) {
    console.error(
      "Error processing Sipay payment:",
      error.response ? error.response.data : error.message
    );
    throw new Error("Payment failed");
  }
};

export default processSipayPayment;
