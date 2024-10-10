// models/sipayPaymentModel/sipayPaymentModel.js
const mongoose = require('mongoose');

const sipayPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  transactionId: { type: String, required: true },
  merchantId: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'TRY' },
  cardNumber: { type: String, required: true },
  expireMonth: { type: Number, required: true },
  expireYear: { type: Number, required: true },
  cvv: { type: String, required: true },
  buyer: { type: Object, required: true },
  billingAddress: { type: Object, required: true },
  status: { type: String, default: 'pending' },
}, { timestamps: true });

module.exports = mongoose.model('SipayPayment', sipayPaymentSchema);
