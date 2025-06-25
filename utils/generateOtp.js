// utils/generateOtp.js

/**
 * Generates a 6-digit numeric OTP code.
 * @returns {string} The generated OTP.
 */
export function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
