const { processSipayPayment } = require('../utils/sipayPayment');
const SipayPayment = require('../models/sipayPayment.model'); // Import the model

// Save Payment function
const savePayment = async (paymentData, userId) => {
  const newPayment = new SipayPayment({
    userId: userId,
    merchantId: process.env.SIPAY_MERCHANT_ID,
    amount: paymentData.amount,
    currency: paymentData.currency || 'TRY',
    cardNumber: paymentData.cardNumber,
    expireMonth: paymentData.expireMonth,
    expireYear: paymentData.expireYear,
    cvv: paymentData.cvv,
    buyerName: paymentData.nameOnCard,
    buyerEmail: paymentData.buyerEmail,
    billingAddress: paymentData.billingAddress,
    billingCity: paymentData.billingCity,
    billingCountry: paymentData.billingCountry,
    billingZipCode: paymentData.billingZipCode,
    status: 'pending',
    phoneNumber: paymentData.phoneNumber,
    companyName: paymentData.companyName,
    whereDidYouHear: paymentData.whereDidYouHear,
  });

  console.log('New Payment Object:', newPayment); // Log the new payment object

  await newPayment.save();
  return newPayment;
};

// Controller to process payment
exports.processPayment = async (req, res) => {
  try {
    const paymentData = req.body;
    console.log('Payment Data Received:', paymentData); // Log the incoming payment data

    const userId = req.user ? req.user._id : null;
    console.log('User ID:', userId); // Log the user ID

    // Call the processSipayPayment function
    const paymentResult = await processSipayPayment({
      ...paymentData,
      expireMonth: Number(paymentData.expireMonth),
      expireYear: Number(paymentData.expireYear),
    });

    console.log('Payment Result from Sipay:', paymentResult); // Log the payment result

    // Check if payment processing was successful
    if (paymentResult.status_code !== 100) {
      console.error('Payment Processing Failed:', paymentResult); // Log the failure reason
      return res.status(400).json({
        status: 'failure',
        message: 'Payment processing failed.',
        paymentResult, // Include payment result in the response for debugging
      });
    }

    // Save payment details to the database without transactionId
    const savedPayment = await savePayment(paymentData, userId);
    console.log('Saved Payment:', savedPayment); // Log the saved payment

    res.status(200).json({
      status: 'success',
      message: 'Payment processed successfully',
      data: {
        paymentResult,
        savedPayment,
      },
    });
  } catch (error) {
    console.error('Payment Processing Error:', error); // Log the error stack
    res.status(500).json({ status: 'failure', message: 'Payment failed', error: error.message });
  }
};
