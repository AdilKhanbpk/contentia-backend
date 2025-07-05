// utils/netgsmServiceOtp.js
// Netgsm OTP SMS sender helper (ESM version)
// Usage: sendOtp(phone, otp)
import axios from 'axios';
import xml2js from 'xml2js';

const NETGSM_USERCODE = process.env.NETGSM_USERCODE || '8503091122';
const NETGSM_PASSWORD = process.env.NETGSM_PASSWORD || 'Contentia_1807*';
const NETGSM_MSGHEADER = process.env.NETGSM_MSGHEADER || '8503091122';
const NETGSM_OTP_URL = process.env.NETGSM_OTP_URL || 'https://api.netgsm.com.tr/sms/send/otp';

// Debug: Log the actual values being used
console.log('🔧 Netgsm Configuration:');
console.log('   URL:', NETGSM_OTP_URL);
console.log('   Usercode:', NETGSM_USERCODE);
console.log('   Password:', NETGSM_PASSWORD ? NETGSM_PASSWORD.substring(0, 5) + '***' : 'NOT SET');
console.log('   Msgheader:', NETGSM_MSGHEADER);

export async function sendOtp(phone, otp) {
  // Validate environment variables
  if (!NETGSM_USERCODE || !NETGSM_PASSWORD) {
    console.error('❌ Netgsm credentials not configured');
    return {
      success: false,
      error: 'SMS service not configured. Please contact support.'
    };
  }

  // Validate and format phone number
  if (!phone || phone.length < 10) {
    return {
      success: false,
      error: 'Invalid phone number format'
    };
  }

  // Format phone number for Netgsm (remove leading 0, ensure 10 digits)
  let formattedPhone = phone.toString().replace(/\D/g, ''); // Remove non-digits
  if (formattedPhone.startsWith('0')) {
    formattedPhone = formattedPhone.substring(1); // Remove leading 0
  }
  if (formattedPhone.length !== 10) {
    return {
      success: false,
      error: 'Phone number must be 10 digits (without country code)'
    };
  }

  console.log('📱 Original phone:', phone);
  console.log('📱 Formatted phone:', formattedPhone);

  // Create XML with formatted phone number
    // Smart msgheader handling based on Turkish mobile operators
    const phonePrefix = formattedPhone.substring(0, 3);

    // Turkish mobile operator prefixes that work with msgheader (mainly Turkcell)
    const operatorsWithHeader = ['530', '531', '532', '533', '534', '535', '536', '537', '538', '539'];
    // Operators that need no msgheader or different handling
    const operatorsWithoutHeader = ['589', '599', '564', '565', '566', '567', '568', '569'];

    let xml;

    if (operatorsWithHeader.includes(phonePrefix)) {
      console.log('📱 Using msgheader for operator prefix:', phonePrefix);
      xml = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <usercode>${NETGSM_USERCODE}</usercode>
    <password>${NETGSM_PASSWORD}</password>
    <msgheader>${NETGSM_MSGHEADER}</msgheader>
  </header>
  <body>
    <msg><![CDATA[Contentia Doğrulama Kodu: ${otp}]]></msg>
    <no>${formattedPhone}</no>
  </body>
</mainbody>`;
    } else {
      console.log('� Using NO msgheader for operator prefix:', phonePrefix);
      xml = `<?xml version="1.0" encoding="UTF-8"?>
<mainbody>
  <header>
    <usercode>${NETGSM_USERCODE}</usercode>
    <password>${NETGSM_PASSWORD}</password>
    <msgheader>${NETGSM_USERCODE}</msgheader>
  </header>
  <body>
    <msg><![CDATA[Contentia Doğrulama Kodu: ${otp}]]></msg>
    <no>${formattedPhone}</no>
  </body>
</mainbody>`;
    }



  console.log('📤 Sending SMS to Netgsm API...');
  console.log('📱 Phone:', phone);
  console.log('🔑 Using usercode:', NETGSM_USERCODE);
  console.log('🔑 Using password:', NETGSM_PASSWORD ? 'SET' : 'NOT SET');
  console.log('📋 XML Request:', xml);
  console.log('🌍 Environment variables check:', {
    NETGSM_USERCODE_ENV: process.env.NETGSM_USERCODE ? 'SET' : 'NOT SET',
    NETGSM_PASSWORD_ENV: process.env.NETGSM_PASSWORD ? 'SET' : 'NOT SET',
    NETGSM_MSGHEADER_ENV: process.env.NETGSM_MSGHEADER ? 'SET' : 'NOT SET'
  });

  try {
    let response = await axios.post(NETGSM_OTP_URL, xml, {
      headers: {
        'Content-Type': 'text/xml',
        'Accept': 'application/xml-dtd'
      },
      timeout: 10000,
    });

    // Check for error 32 (operator code error) and provide helpful message
    const checkResult = await xml2js.parseStringPromise(response.data, { explicitArray: false });
    if (checkResult.xml?.main?.code === '32') {
      console.log('⚠️ Error 32: This phone number operator is not supported by your current msgheader');
      console.log('💡 Contact Netgsm to get msgheader approved for this operator');
    }

    console.log('📥 Netgsm raw response:', response.data);

    // Parse XML response
    const result = await xml2js.parseStringPromise(response.data, { explicitArray: false });
    const code = result.xml.main.code;
    const jobID = result.xml.main.jobID;
    const error = result.xml.main.error;

    console.log('📊 Parsed response:', { code, jobID, error });

    // Netgsm error codes with user-friendly messages
    const errorMessages = {
      '20': 'Mesaj metninde ki problemden dolayı gönderilemediği durumda alınan hatadır.',
      '30': 'Geçersiz kullanıcı adı, şifre veya kullanıcınızın API erişim izninin olmadığı durumdur.',
      '32': 'Bu telefon numarası operatörü şu anda desteklenmiyor. Lütfen farklı bir numara deneyin.',
      '40': 'Mesaj başlığınızın (Gönderici Adınızın) sistemde tanımlı olmadığı durumdur.',
      '50': 'Abone hesabınızda yeterli kredinin olmadığı durumdur.',
      '60': 'Kota aşımı. Günlük gönderim limitinizi aştığınız durumdur.',
      '70': 'Hatalı sorgulama. Gönderdiğiniz parametrelerden birisi hatalıdır.'
    };

    if (code === '0') {
      return { success: true, jobID };
    } else {
      const detailedError = errorMessages[code] || error || 'Unknown error';
      console.error(`❌ Netgsm Error Code ${code}: ${detailedError}`);

      // For error 32, provide a user-friendly message
      if (code === '32') {
        return {
          success: false,
          error: 'Bu telefon numarası operatörü şu anda desteklenmiyor. Lütfen farklı bir numara deneyin veya destek ile iletişime geçin.',
          code,
          technical_error: error
        };
      }

      return { success: false, error: detailedError, code };
    }
  } catch (err) {
    console.error('❌ Netgsm API error:', err.message);
    return { success: false, error: err.message };
  }
}

export async function resendOtpfunction(phone , verificationCode) {

  const xml = `<?xml version="1.0"?>\n<mainbody>\n  <header>\n    <usercode>${NETGSM_USERCODE}</usercode>\n    <password>${NETGSM_PASSWORD}</password>\n    <msgheader>${NETGSM_MSGHEADER}</msgheader>\n  </header>\n  <body>\n    <msg><![CDATA[Contentia Doğrulama Kodu: ${verificationCode}]]></msg>\n    <no>${phone}</no>\n  </body>\n</mainbody>`;

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

export async function validateNetgsmAccount() {
  console.log('🔍 Validating Netgsm account...');

  // Test with a simple balance check
  const balanceUrl = 'https://api.netgsm.com.tr/balance/list/xml';
  const xml = `<?xml version="1.0"?>
<mainbody>
  <header>
    <usercode>${NETGSM_USERCODE}</usercode>
    <password>${NETGSM_PASSWORD}</password>
  </header>
</mainbody>`;

  try {
    const response = await axios.post(balanceUrl, xml, {
      headers: { 'Content-Type': 'text/xml' },
      timeout: 10000,
    });

    console.log('💰 Balance check response:', response.data);

    // Check if response is just an error code (not XML)
    if (typeof response.data === 'string' && response.data.trim().match(/^\d+$/)) {
      const errorCode = response.data.trim();
      const errorMessages = {
        '30': 'Geçersiz kullanıcı adı, şifre veya API erişim izni yok',
        '40': 'Mesaj başlığı sistemde tanımlı değil',
        '50': 'Yetersiz kredi',
        '60': 'Günlük limit aşımı',
        '70': 'Hatalı parametre'
      };

      const errorMessage = errorMessages[errorCode] || `Bilinmeyen hata kodu: ${errorCode}`;
      console.log(`❌ Netgsm Error Code ${errorCode}: ${errorMessage}`);
      return { valid: false, error: errorMessage, code: errorCode };
    }

    try {
      const result = await xml2js.parseStringPromise(response.data, { explicitArray: false });

      if (result.xml && result.xml.main) {
        const code = result.xml.main.code;
        if (code === '0') {
          console.log('✅ Netgsm account is valid');
          return { valid: true, balance: result.xml.main.amount };
        } else {
          console.log('❌ Netgsm account validation failed:', result.xml.main.error);
          return { valid: false, error: result.xml.main.error };
        }
      }

      return { valid: false, error: 'Invalid response format' };
    } catch (xmlError) {
      console.log('❌ XML parsing failed, raw response:', response.data);
      return { valid: false, error: `Invalid response: ${response.data}` };
    }
  } catch (error) {
    console.error('❌ Account validation error:', error.message);
    return { valid: false, error: error.message };
  }
}

export function handleSmsError(result) {
  return {
    statusCode: 500,
    errorMessage: result.error || 'Failed to send SMS',
  };
}
