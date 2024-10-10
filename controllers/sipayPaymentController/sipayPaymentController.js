// controllers/sipayPaymentController/sipayPaymentController.js
const { processSipayPayment } = require('../../utils/sipayPayment');
const SipayPayment = require('../../models/sipayPaymentModel/sipayPaymentModel'); // Import the model

// Save Payment function
const savePayment = async (paymentData, transactionId, userId) => {
  const newPayment = new SipayPayment({
    userId: userId,
    transactionId: transactionId,
    merchantId: process.env.SIPAY_MERCHANT_ID,
    amount: paymentData.amount,
    currency: paymentData.currency || 'TRY',
    cardNumber: paymentData.cardNumber, // Masked version should be used in real scenarios
    expireMonth: paymentData.expireMonth,
    expireYear: paymentData.expireYear,
    cvv: paymentData.cvv,
    buyer: paymentData.buyer,
    billingAddress: paymentData.billing_address,
    status: 'pending',
  });

  await newPayment.save();
  return newPayment;
};

// Controller to process payment
exports.processPayment = async (req, res) => {
  try {
    const paymentData = req.body;

    // Obtain userId from the request (adjust this based on your authentication method)
    const userId = req.user ? req.user._id : null; // Assuming user ID is in req.user, adapt as needed

    // Call the processSipayPayment function
    const paymentResult = await processSipayPayment(paymentData);

    // Save payment details to the database
    const savedPayment = await savePayment(paymentData, paymentResult.transactionId, userId);

    res.status(200).json({
      status: 'success',
      message: 'Payment processed successfully',
      data: {
        paymentResult,
        savedPayment // Optionally return the saved payment object
      }
    });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ status: 'failure', message: 'Payment failed', error: error.message });
  }
};
