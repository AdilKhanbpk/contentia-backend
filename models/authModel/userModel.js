const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rememberMe: {
    type: Boolean,
    default: false, // For "Beni Hatırla"
  },
  termsAccepted: {
    type: Boolean,
    default: false, // For "Kullanıcı Sözleşmesi"
  },
  marketingConsent: {
    type: Boolean,
    default: false, // For "Ticari Elektronik İleti"
  },
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt fields
});

userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
