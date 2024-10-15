const mongoose = require('mongoose');

const sipayPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  merchantId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'TRY' },
  cardNumber: { type: String, required: true },
  expireMonth: { type: Number, required: true },
  expireYear: { type: Number, required: true },
  cvv: { type: String, required: true },
  buyerName: { type: String, required: true }, // Make sure this is updated in your data flow
  buyerEmail: { type: String, required: true },
  billingAddress: { type: String, required: true },
  billingCity: { type: String, required: true },
  billingCountry: { type: String, required: true },
  billingZipCode: { type: String, required: true },
  status: { type: String, default: 'pending' },
  phoneNumber: { type: String },
  companyName: { type: String },
  whereDidYouHear: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('SipayPayment', sipayPaymentSchema);
