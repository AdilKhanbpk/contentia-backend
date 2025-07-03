/**
 * Invoice Email Template Helper
 * Generates email content with invoice sharing links
 */

/**
 * Generate HTML email template with invoice link
 */
export function generateInvoiceEmailHTML(invoiceLink, orderDetails = {}) {
    const {
        customerName = 'Valued Customer',
        orderNumber = '',
        totalAmount = '',
        invoiceNumber = '',
        companyName = 'Contentia',
        isPublicLink = false,
        sharingEmailSent = false
    } = orderDetails;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice - ${invoiceNumber}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px; }
        .content { padding: 20px 0; }
        .invoice-button { 
            display: inline-block; 
            background-color: #007bff; 
            color: white; 
            padding: 12px 24px; 
            text-decoration: none; 
            border-radius: 5px; 
            font-weight: bold;
            margin: 20px 0;
        }
        .invoice-button:hover { background-color: #0056b3; }
        .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .invoice-details { background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${companyName}</h1>
            <h2>Invoice Ready</h2>
        </div>
        
        <div class="content">
            <p>Dear ${customerName},</p>
            
            <p>Your invoice is ready and available for viewing online.</p>
            
            ${orderNumber ? `<p><strong>Order Number:</strong> ${orderNumber}</p>` : ''}
            
            <div class="invoice-details">
                <h3>Invoice Details:</h3>
                <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
                ${totalAmount ? `<p><strong>Total Amount:</strong> ${totalAmount} TL</p>` : ''}
            </div>
            
            <div style="text-align: center;">
                <a href="${invoiceLink.url}" class="invoice-button">
                    📄 ${invoiceLink.linkText}
                </a>
            </div>
            
            <p><strong>What you can do with this link:</strong></p>
            <ul>
                <li>View your complete invoice online</li>
                <li>Download a PDF copy</li>
                <li>Print the invoice</li>
                <li>Access it anytime from any device</li>
                ${isPublicLink ?
                    '<li>✅ <strong>No login required</strong> - Direct access</li>' :
                    '<li>📧 <strong>Login with your email</strong> - Use the same email address this invoice was sent to</li>'
                }
            </ul>

            ${sharingEmailSent ? `
            <div style="background-color: #e8f5e8; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #28a745;">
                <h4 style="margin: 0 0 10px 0; color: #28a745;">📧 Additional Invoice Access:</h4>
                <p style="margin: 0;">You should also receive a separate email from Paraşüt with a direct public link to your invoice. Check your inbox for an email with the subject "Your Invoice is Ready".</p>
            </div>
            ` : (!isPublicLink ? `
            <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #007bff;">
                <h4 style="margin: 0 0 10px 0; color: #007bff;">📧 How to Access Your Invoice:</h4>
                <p style="margin: 0;">When you click the link above, you'll be asked to enter your email address. Please use: <strong>${orderDetails.customerEmail || 'the email address this invoice was sent to'}</strong></p>
            </div>
            ` : '')}
            
            <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
            
            
            <p>Best regards,<br>
            ${companyName} Team</p>
        </div>
        
        <div class="footer">
            <p>This is an automated email. Please do not reply to this email.</p>
            <p>If you need assistance, please contact our support team.</p>
        </div>
    </div>
</body>
</html>`;
}

/**
 * Generate plain text email template with invoice link
 */
export function generateInvoiceEmailText(invoiceLink, orderDetails = {}) {
    const {
        customerName = 'Valued Customer',
        orderNumber = '',
        totalAmount = '',
        invoiceNumber = '',
        companyName = 'Contentia'
    } = orderDetails;

    return `
${companyName} - Invoice Ready

Dear ${customerName},

Your invoice is ready and available for viewing online.

${orderNumber ? `Order Number: ${orderNumber}` : ''}

Invoice Details:
- Invoice Number: ${invoiceNumber}
${totalAmount ? `- Total Amount: ${totalAmount} TL` : ''}

View Your Invoice Online:
${invoiceLink.url}

What you can do with this link:
- View your complete invoice online
- Download a PDF copy  
- Print the invoice
- Access it anytime from any device

If you have any questions about this invoice, please don't hesitate to contact us.


Best regards,
${companyName} Team

---
This is an automated email. Please do not reply to this email.
If you need assistance, please contact our support team.
`;
}

/**
 * Generate WhatsApp message with invoice link
 */
export function generateInvoiceWhatsAppMessage(invoiceLink, orderDetails = {}) {
    const {
        customerName = 'Valued Customer',
        orderNumber = '',
        invoiceNumber = '',
        companyName = 'Contentia'
    } = orderDetails;

    return `🧾 *${companyName} - Invoice Ready*

Hello ${customerName}! 👋

Your invoice is ready and available online.

📋 *Invoice Details:*
${orderNumber ? `• Order: ${orderNumber}` : ''}
• Invoice: ${invoiceNumber}

🔗 *View Invoice:*
${invoiceLink.url}

You can view, download, and print your invoice anytime using this link.

Thank you for choosing ${companyName}! 🙏`;
}

export default {
    generateInvoiceEmailHTML,
    generateInvoiceEmailText,
    generateInvoiceWhatsAppMessage
};
