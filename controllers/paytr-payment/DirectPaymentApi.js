import axios from "axios";
import asyncHandler from "../../utils/asyncHandler.js";
import crypto from 'crypto'

// app.post('/api/direct-payment', async (req, res) => {

const PAYTR_CONFIG = {
    merchant_id: '585039',
    merchant_key: '1JFijfWj9SYWqtSE',
    merchant_salt: 'y33EMdcHFGCUTbzo',
};

// const PAYTR_CONFIG = {
//     merchant_id: process.env.PAYTR_merchant_id,
//     merchant_key : process.env.PAYTR_merchant_key ,
//     merchant_salt : process.env.PAYTR_merchant_salt ,
// };
const PaymentApi = asyncHandler(async (req, res) => {
    try {
        const {
            amount,
            orderId,
            userEmail,
            userName,
            userPhone,
            cardNumber,
            expiryMonth,
            expiryYear,
            cvv,
            nameOnCard
        } = req.body;

        if (!amount || !orderId || !userEmail || !userName || !cardNumber ||
            !expiryMonth || !expiryYear || !cvv || !nameOnCard) {
            return res.status(400).json({
                success: false,
                message: 'Missing required card or payment fields'
            });
        }

        const userIP = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            '127.0.0.1';

        const cleanCardNumber = cardNumber.replace(/\s/g, '');

        const user_basket = JSON.stringify([["Ürün", amount.toString(), 1]]);

        const paytrData = {
            merchant_id: PAYTR_CONFIG.merchant_id,
            user_ip: userIP.replace('::1', '127.0.0.1'),
            merchant_oid: orderId,
            email: userEmail,
            payment_amount: amount,
            payment_type: 'card',
            installment_count: 0,
            currency: 'TL',
            test_mode: '1',
            non_3d: '0',
            user_name: userName,
            user_address: 'Sample Address',
            user_phone: userPhone,
            merchant_ok_url: 'https://contentia-frontend-git-payment-saudkhanbpks-projects.vercel.app/payment/success',
            // merchant_ok_url: 'http://localhost:3000/payment/success',
            merchant_fail_url: 'https://contentia-frontend-git-payment-saudkhanbpks-projects.vercel.app/payment/Failed',
            // merchant_fail_url: 'http://localhost:3000/payment/Failed',
            user_basket,
            debug_on: 1,
            client_lang: 'tr',
            cc_owner: nameOnCard,
            card_number: cleanCardNumber,
            expiry_month: expiryMonth.padStart(2, '0'),
            expiry_year: expiryYear,
            cvv: cvv,
            non_3d: 0,
            non3d_test_failed: 1
        };

        const hashStr =
            paytrData.merchant_id +
            paytrData.user_ip +
            paytrData.merchant_oid +
            paytrData.email +
            paytrData.payment_amount +
            paytrData.payment_type +
            paytrData.installment_count +
            paytrData.currency +
            paytrData.test_mode +
            paytrData.non_3d;


        const hashStrWithSalt = hashStr + PAYTR_CONFIG.merchant_salt;
        console.log('Hash String with Salt:', hashStrWithSalt);
        const paytr_token = crypto
            .createHmac('sha256', PAYTR_CONFIG.merchant_key)
            .update(hashStrWithSalt)
            .digest('base64');
        paytrData.paytr_token = paytr_token;
        console.log("token: ", paytr_token);

        const formData = new URLSearchParams(paytrData);


        const response = await axios.post('https://www.paytr.com/odeme', formData.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const contentType = response.headers['content-type'];

        if (contentType && contentType.includes('text/html')) {
            res.set('Content-Type', 'text/html');
            return res.send(response.data);
        } else {
            return res.json({ success: false, message: 'Unexpected response from PayTR' });
        }
    } catch (error) {
        console.error('PayTR Error:', error);
        if (!res.headersSent) {
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
});

const PaymentApiCallBack = asyncHandler(async (req, res) => {
    try {
        const {
            merchant_oid,
            status,
            total_amount,
            hash,
            failed_reason_code,
            failed_reason_msg,
            test_mode,
            payment_type,
            currency,
            payment_amount
        } = req.body;

        console.log("callback", req.body);

        // Verify hash
        const hashStr = merchant_oid + PAYTR_CONFIG.merchant_salt + status + total_amount;
        const calculatedHash = crypto.createHmac('sha256', PAYTR_CONFIG.merchant_key)
            .update(hashStr)
            .digest('base64');

        if (hash !== calculatedHash) {
            console.error('Hash verification failed');
            return res.status(400).send('PAYTR notification failed');
        }

        // Log or store payment info
        if (status === 'success') {
            console.log(`✅ Payment success for order: ${merchant_oid}`);
            // Update database, etc.
        } else {
            console.log(`❌ Payment failed for order: ${merchant_oid}`);
            console.log(`Reason: ${failed_reason_msg}`);
        }

        // 🔄 Respond with HTML that sends a message to the parent iframe
        res.send("OK");

    } catch (error) {
        console.error('Callback processing error:', error);
        res.status(500).send('PAYTR notification failed');
    }
});



// Check payment status endpoint
const OrderendPoint = asyncHandler(async (req, res) => {

    try {
        const { orderID } = req.params;

        // TODO: Check order status in your database
        // const order = await getOrderStatus(orderID);

        res.json({
            success: true,
            status: 'pending', // or 'success', 'failed'
            orderID: orderID
        });

    } catch (error) {
        console.error('Status check error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
})
export {
    PaymentApi,
    PaymentApiCallBack,
    OrderendPoint
}