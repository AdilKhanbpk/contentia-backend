// utils/netgsmServiceOtp.js
// Netgsm OTP SMS sender helper (ESM version)
// Usage: sendOtp(phone, otp)
import axios from 'axios';
import xml2js from 'xml2js';

const NETGSM_USERCODE = process.env.NETGSM_USERCODE || '8503091122';
const NETGSM_PASSWORD = process.env.NETGSM_PASSWORD || 'v7.V7F76';
const NETGSM_MSGHEADER = process.env.NETGSM_MSGHEADER || '8503091122';
const NETGSM_OTP_URL = 'https://api.netgsm.com.tr/sms/send/otp';

export async function sendOtp(phone, otp) {
  const xml = `<?xml version="1.0"?>\n<mainbody>\n  <header>\n    <usercode>${NETGSM_USERCODE}</usercode>\n    <password>${NETGSM_PASSWORD}</password>\n    <msgheader>${NETGSM_MSGHEADER}</msgheader>\n  </header>\n  <body>\n    <msg><![CDATA[Contentia Doğrulama Kodu: ${otp}]]></msg>\n    <no>${phone}</no>\n  </body>\n</mainbody>`;

  try {
    const response = await axios.post(NETGSM_OTP_URL, xml, {
      headers: { 'Content-Type': 'text/xml' },
      timeout: 10000,
    });
    // Parse XML response
    const result = await xml2js.parseStringPromise(response.data, { explicitArray: false });
    const code = result.xml.main.code;
    const jobID = result.xml.main.jobID;
    if (code === '0') {
      return { success: true, jobID };
    } else {
      return { success: false, error: result.xml.main.error || 'Unknown error', code };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// export async function resendOtpfunction(phone , verificationCode) {

//   const xml = `<?xml version="1.0"?>\n<mainbody>\n  <header>\n    <usercode>${NETGSM_USERCODE}</usercode>\n    <password>${NETGSM_PASSWORD}</password>\n    <msgheader>${NETGSM_MSGHEADER}</msgheader>\n  </header>\n  <body>\n    <msg><![CDATA[Contentia Doğrulama Kodu: ${verificationCode}]]></msg>\n    <no>${phone}</no>\n  </body>\n</mainbody>`;

//   try {
//     const response = await axios.post(NETGSM_OTP_URL, xml, {
//       headers: { 'Content-Type': 'text/xml' },
//       timeout: 10000,
//     });
//     // Parse XML response
//     const result = await xml2js.parseStringPromise(response.data, { explicitArray: false });
//     const code = result.xml.main.code;
//     const jobID = result.xml.main.jobID;
//     if (code === '0') {
//       return { success: true, jobID };
//     } else {
//       return { success: false, error: result.xml.main.error || 'Unknown error', code };
//     }
//   } catch (err) {
//     return { success: false, error: err.message };
//   }
// }

export function handleSmsError(result) {
  return {
    statusCode: 500,
    errorMessage: result.error || 'Failed to send SMS',
  };
}
