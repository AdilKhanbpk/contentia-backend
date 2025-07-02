import dotenv from 'dotenv';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sendEmail from './email.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CLIENT_ID = process.env.PARASUT_CLIENT_ID;
const CLIENT_SECRET = process.env.PARASUT_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.PARASUT_REFRESH_TOKEN;

class ParasutApiService {
    constructor() {
        // Official Paraşüt API endpoints
        this.baseURL = process.env.PARASUT_API_BASE_URL || 'https://api.parasut.com/v4';
        this.testURL = process.env.PARASUT_TEST_URL || 'https://api.parasut.com/v4';

        // OAuth 2.0 credentials for Paraşüt
        this.clientId = process.env.PARASUT_CLIENT_ID;
        this.clientSecret = process.env.PARASUT_CLIENT_SECRET;
        this.companyId = process.env.PARASUT_COMPANY_ID;
        this.redirectUri = process.env.PARASUT_REDIRECT_URI || 'urn:ietf:wg:oauth:2.0:oob';

        // Disable Paraşüt integration if credentials are not working
        this.isEnabled = process.env.PARASUT_ENABLED !== 'false';
        
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;

        // Load stored tokens
        this.loadStoredTokens();
        
        // Company information for invoice creation
        this.companyInfo = {
            tradeTitle: "Uzmanlio Information Technologies Marketing and Trading Inc.",
            customerNo: "469071",
            documentType: "Invoice",
            sector: "Software/Technology",
            fullAddress: "Maslak Square Street Beybi Giz Plaza A Block 1 / 55 Maslak Neighborhood Sariyer Istanbul 34398 Maslak Neighborhood Sariyer, ISTANBUL",
            taxInfo: "VD Maslak VD V.NO. 9010533932",
            centralRegistryNumber: "0901 0533 9322 0001",
            tradeRegistryNumber: "393468-5"
        };
    }

    /**
     * Get authorization URL for Paraşüt OAuth 2.0 Authorization Code Grant
     */
    getAuthorizationUrl() {
        const params = new URLSearchParams({
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            response_type: 'code',
            scope: 'read+write',
            company_id: this.companyId
        });
        return `https://api.parasut.com/oauth/authorize?${params.toString()}`;
    }

    /**
     * Check if we have a valid access token
     */
    hasValidToken() {
        return this.accessToken && this.refreshToken && this.tokenExpiry && Date.now() < this.tokenExpiry;
    }

    /**
     * Clear all stored tokens
     */
    clearTokens() {
        console.log('🧹 Clearing all Paraşüt tokens...');
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        delete process.env.PARASUT_ACCESS_TOKEN;
        delete process.env.PARASUT_REFRESH_TOKEN;
        delete process.env.PARASUT_TOKEN_EXPIRY;
        console.log('✅ All tokens cleared');
    }

    /**
     * Load stored tokens from environment variables
     */
    loadStoredTokens() {
        if (process.env.PARASUT_ACCESS_TOKEN && process.env.PARASUT_TOKEN_EXPIRY) {
            const expiry = parseInt(process.env.PARASUT_TOKEN_EXPIRY);
            if (Date.now() < expiry) {
                this.accessToken = process.env.PARASUT_ACCESS_TOKEN;
                this.refreshToken = process.env.PARASUT_REFRESH_TOKEN;
                this.tokenExpiry = expiry;
                console.log('✅ Loaded stored Paraşüt tokens from environment');
                console.log(`   Token preview: ${this.accessToken.substring(0, 10)}...`);
                console.log(`   Expires: ${new Date(this.tokenExpiry).toISOString()}`);
            } else {
                console.log('❌ Stored tokens are expired, attempting to refresh...');
                this.accessToken = process.env.PARASUT_ACCESS_TOKEN;
                this.refreshToken = process.env.PARASUT_REFRESH_TOKEN;
                this.tokenExpiry = expiry;
                console.log('   Token accessToken:', this.accessToken + '...');

                if (this.refreshToken) {
                    this.refreshAccessToken()
                        .then((tokenData) => {
                            console.log('✅ Token refreshed successfully in loadStoredTokens', tokenData);
                        })
                        .catch((err) => {
                            console.log('❌ Failed to refresh token in loadStoredTokens:', err.message);
                            this.clearTokens();
                        });
                } else {
                    this.clearTokens();
                }
            }
        } else {
            console.log('❌ No stored tokens found in environment');
        }
    }

    /**
     * Store tokens in memory and environment variables
     */
    storeTokens(tokenData) {
        if (!tokenData || !tokenData.access_token) {
            console.error('❌ Invalid token data received:', tokenData);
            throw new Error('Invalid token data received from Paraşüt API');
        }

        this.accessToken = tokenData.access_token;
        if (tokenData.refresh_token) {
            this.refreshToken = tokenData.refresh_token;
        }
        this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);

        process.env.PARASUT_ACCESS_TOKEN = this.accessToken;
        if (this.refreshToken) {
            process.env.PARASUT_REFRESH_TOKEN = this.refreshToken;
        }
        process.env.PARASUT_TOKEN_EXPIRY = this.tokenExpiry.toString();

        console.log('✅ Tokens updated in memory and environment');
        console.log(`   Access token: ${this.accessToken.substring(0, 10)}...`);
        console.log(`   Refresh token: ${this.refreshToken ? this.refreshToken.substring(0, 10) + '...' : 'unchanged'}`);
        console.log(`   Expires: ${new Date(this.tokenExpiry).toISOString()}`);
    }

    /**
     * Exchange authorization code for access token
     */
    async exchangeCodeForToken(authorizationCode) {
        try {
            const formData = new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                code: authorizationCode,
                grant_type: 'authorization_code',
                redirect_uri: this.redirectUri
            });

            const response = await axios.post('https://api.parasut.com/oauth/token', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            });

            this.storeTokens(response.data);
            console.log('✅ Paraşüt API token exchange successful');
            return response.data;
        } catch (error) {
            console.error('❌ Token exchange failed:', error.response?.data?.error_description || error.message);
            throw new Error(`Failed to exchange code for token: ${error.response?.data?.error_description || error.message}`);
        } 
    }

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken() {
        try {
            console.log('🚀🚀👨 Refreshing Paraşüt access token...for client', this.clientId, "Client Secret:", this.clientSecret, "old token:", this.refreshToken);
            const formData = new URLSearchParams({
                client_id: this.clientId,
                client_secret: this.clientSecret,
                refresh_token: this.refreshToken,
                grant_type: 'refresh_token'
            });

            const response = await axios.post('https://api.parasut.com/oauth/token', formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                }
            });

            this.storeTokens(response.data);
            console.log('✅ Token refreshed successfully');
            console.log("Here are the refresh and access tokens" , response.data);
            const { access_token, refresh_token, expires_in } = response.data;

            // Calculate expiry timestamp
            const expiryTimestamp = Date.now() + (expires_in * 1000);
            
            // Read current .env file
            const envPath = path.join(__dirname, '..', '.env');
            let envContent = '';
            
            if (fs.existsSync(envPath)) {
                envContent = fs.readFileSync(envPath, 'utf8');
            }
            
            // Update or add Paraşüt tokens
            const tokenLines = [
                `PARASUT_ACCESS_TOKEN=${access_token}`,
                `PARASUT_REFRESH_TOKEN=${refresh_token}`,
                `PARASUT_TOKEN_EXPIRY=${expiryTimestamp}`
            ];
            
            // Remove existing Paraşüt token lines
            const lines = envContent.split('\n').filter(line => 
                !line.startsWith('PARASUT_ACCESS_TOKEN=') &&
                !line.startsWith('PARASUT_REFRESH_TOKEN=') &&
                !line.startsWith('PARASUT_TOKEN_EXPIRY=')
            );
            
            // Add new token lines
            const newEnvContent = [...lines, ...tokenLines].join('\n');
            
            // Write back to .env file
            fs.writeFileSync(envPath, newEnvContent);
            
            return response.data;
        } catch (error) {
            console.error('❌ Token refresh failed:', error.response || error.message);
            if (error.response?.status === 401 || error.response?.data?.error === 'invalid_grant') {
                console.log('🔄 Invalid refresh token, clearing tokens...');
                this.clearTokens();
                throw new Error('Refresh token invalid. Please re-authenticate: ' + this.getAuthorizationUrl());
            }
            throw error;
        }
    }

    /**
     * Ensure a valid token is available
     */
    async ensureValidToken() {
        this.loadStoredTokens();

        if (!this.accessToken || !this.tokenExpiry) {
            throw new Error(`No valid access token. Please authenticate: ${this.getAuthorizationUrl()}`);
        }

        const timeUntilExpiry = this.tokenExpiry - Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        console.log(`🕐 Token expires in ${Math.round(timeUntilExpiry / 1000)} seconds`);

        if (timeUntilExpiry <= fiveMinutes) {
            console.log('🔄 Token expired or expiring soon, refreshing...');
            await this.refreshAccessToken();
        } else {
            console.log('✅ Access token is valid');
        }
    }

    /**
     * Make authenticated API request (with retry on 429)
     */
    async makeRequest(method, endpoint, data = null, retryCount = 0) {
        await this.ensureValidToken();

        if (!this.companyId) {
            throw new Error('Company ID not configured. Please set PARASUT_COMPANY_ID.');
        }

        const config = {
            method,
            url: `${this.baseURL}/${this.companyId}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        };

        if (data) {
            config.data = data;
        }

        console.log('\n' + '='.repeat(80));
        console.log(`🚀 PARAŞÜT API REQUEST: ${method} ${endpoint}`);
        console.log('📍 URL:', config.url);
        console.log('🔑 Headers:', { ...config.headers, Authorization: 'Bearer [REDACTED]' });
        if (data) {
            console.log('📦 Request Body:', JSON.stringify(data, null, 2));
        }
        console.log('='.repeat(80));

        try {
            const response = await axios(config);
            console.log('✅ PARAŞÜT API SUCCESS RESPONSE:');
            console.log('📊 Status:', response.status, response.statusText);
            console.log('📥 Response Data:', JSON.stringify(response.data, null, 2));
            console.log('='.repeat(80) + '\n');
            return response.data;
        } catch (error) {
            // Retry on 429 Too Many Requests
            if (error.response && error.response.status === 429 && retryCount < 3) {
                const delay = 2000 * (retryCount + 1); // Exponential backoff: 2s, 4s, 6s
                console.warn(`⚠️ 429 Too Many Requests. Retrying after ${delay / 1000} seconds... (Attempt ${retryCount + 1})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.makeRequest(method, endpoint, data, retryCount + 1);
            }
            console.log('❌ PARAŞÜT API ERROR RESPONSE:');
            console.log('📊 Status:', error.response?.status, error.response?.statusText);
            console.log('📥 Response Data:', JSON.stringify(error.response?.data, null, 2));
            if (error.response?.data?.errors) {
                console.log('🔍 VALIDATION ERRORS:');
                error.response.data.errors.forEach((err, index) => {
                    console.log(`  ${index + 1}. Error: ${err.title || 'N/A'}, Detail: ${err.detail || 'N/A'}, Code: ${err.code || 'N/A'}`);
                });
            }
            if (error.response?.status === 404) {
                console.error('404 Error Details:', error.response.data.errors);
            }
            console.log('='.repeat(80) + '\n');
            throw error;
        }
    }

    /**
     * Get a default financial account for payments
     */
    async getDefaultAccount() {
        try {
            const response = await this.makeRequest('GET', '/accounts');
            console.log('📋 Available Accounts:', JSON.stringify(response.data, null, 2));

            if (response.data && response.data.length > 0) {
                // Prefer cash account, fallback to bank
                const validAccount = response.data.find(acc => acc.attributes.account_type === 'cash') ||
                                    response.data.find(acc => acc.attributes.account_type === 'bank');
                if (!validAccount) {
                    throw new Error('No cash or bank accounts found in Paraşüt.');
                }
                console.log('✅ Selected default account:', validAccount.id, validAccount.attributes.name);
                return validAccount.id.toString();
            }
            throw new Error('No accounts found in Paraşüt. Please configure an account.');
        } catch (error) {
            console.error('❌ Failed to fetch accounts:', error.response?.data || error.message);
            throw new Error('Failed to retrieve default account. Please configure a cash or bank account in Paraşüt: https://uygulama.parasut.com/469071/kasa-ve-bankalar');
        }
    }

    /**
     * Create a new product in Paraşüt
     */
    async createItem(pricePlan) {
        try {
            if (!this.companyId) {
                throw new Error('Company ID not configured. Please set PARASUT_COMPANY_ID.');
            }

            const productData = {
                data: {
                    type: 'products',
                    attributes: {
                        name: pricePlan.title,
                        code: `PROD-${Date.now()}`,
                        vat_rate: 18,
                        list_price: pricePlan.finalPrice,
                        unit: 'Adet',
                        inventory_tracking: false,
                        archived: false
                    }
                }
            };

            const result = await this.makeRequest('POST', '/products', productData);
            console.log('✅ Product created:', result.data.id);
            return result.data.id;
        } catch (error) {
            console.error('❌ Failed to create product:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Update an existing product in Paraşüt
     */
    async updateItem(parasutItemId, pricePlan) {
        try {
            const productData = {
                data: {
                    type: 'products',
                    id: parasutItemId,
                    attributes: {
                        name: pricePlan.title,
                        vat_rate: 18,
                        list_price: pricePlan.finalPrice,
                        unit: 'Adet',
                        inventory_tracking: false,
                        archived: false
                    }
                }
            };

            const result = await this.makeRequest('PUT', `/products/${parasutItemId}`, productData);
            console.log('✅ Product updated:', parasutItemId);
            return result.data;
        } catch (error) {
            console.error('❌ Failed to update product:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Get a product from Paraşüt by ID
     */
    async getItem(parasutItemId) {
        try {
            const result = await this.makeRequest('GET', `/products/${parasutItemId}`);
            return result.data;
        } catch (error) {
            console.error('❌ Failed to get product:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Delete a product from Paraşüt
     */
    async deleteItem(parasutItemId) {
        try {
            await this.makeRequest('DELETE', `/products/${parasutItemId}`);
            console.log('✅ Product deleted:', parasutItemId);
            return true;
        } catch (error) {
            console.error('❌ Failed to delete product:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Sync price plan with Paraşüt (create or update)
     */
    async syncPricePlan(pricePlan) {
        try {
            if (pricePlan.parasut_item_ID) {
                await this.updateItem(pricePlan.parasut_item_ID, pricePlan);
                return pricePlan.parasut_item_ID;
            } else {
                return await this.createItem(pricePlan);
            }
        } catch (error) {
            console.error('❌ Failed to sync price plan:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Create or find a contact in Paraşüt
     */
    async createOrFindContact(customerInfo) {
        try {
            // Validate company access
            await this.makeRequest('GET', '/contacts?page[size]=1');
            console.log('✅ Company access verified');

            // Search for existing contact by email
            if (customerInfo.email) {
                try {
                    const response = await this.makeRequest('GET', `/contacts?filter[email]=${encodeURIComponent(customerInfo.email)}`);
                    if (response.data && response.data.length > 0) {
                        console.log('✅ Found existing contact:', response.data[0].id);
                        return response.data[0].id;
                    }
                } catch (error) {
                    console.log('⚠️ Contact search failed, creating new contact:', error.message);
                }
            }

            // Create new contact
            const attributes = {
                name: customerInfo.name || customerInfo.companyName || 'Customer',
                contact_type: customerInfo.contactType || 'person',
                account_type: 'customer',
                is_abroad: false,
                archived: false,
                email: customerInfo.email || undefined,
                tax_number: customerInfo.taxNumber || undefined,
                tax_office: customerInfo.taxOffice || undefined,
                address: customerInfo.address || undefined,
                city: customerInfo.city || "İstanbul",
                district: customerInfo.district || undefined,
                phone: customerInfo.phone || undefined,
                fax: customerInfo.fax || undefined,
                earcive_payment_type: "KREDIKARTI"
                // "payment_type": "KREDIKARTI/BANKAKARTI",

            };

            const contactData = {
                data: {
                    type: 'contacts',
                    attributes
                }
            };

            const result = await this.makeRequest('POST', '/contacts', contactData);
            console.log('✅ Created new contact:', result.data.id);
            return result.data.id;
        } catch (error) {
            console.error('❌ Failed to create/find contact:', error.response?.data || error.message);
            if (error.response?.status === 404 && error.response?.data?.errors?.[0]?.detail === 'User') {
                throw new Error(`Paraşüt API User not found. Possible causes:
                    1. Invalid client_id: ${this.clientId?.substring(0, 10)}...
                    2. User lacks access to company ${this.companyId}
                    3. Incorrect company ID
                    Actions:
                    - Verify credentials in Paraşüt Developer Portal
                    - Check user permissions for company ${this.companyId}
                    - Contact Paraşüt support: destek@parasut.com`);
            }
            throw error;
        }
    }

    /**
     * Create sales invoice in Paraşüt
     */
    async createSalesInvoice(customerInfo, invoiceDetails) {
        try {
            // Step 1: Create or find contact
            const contactId = await this.createOrFindContact(customerInfo);

            // Step 2: Validate and prepare products
            const detailsData = [];
            for (const item of invoiceDetails.items) {
                let productId = item.parasutProductId;
                if (productId) {
                    try {
                        await this.getItem(productId);
                        console.log('✅ Using existing product:', productId);
                    } catch (error) {
                        console.log('⚠️ Product ID invalid, creating a new product:', error.message);
                        productId = null;
                    }
                }
                if (!productId) {
                    productId = await this.createItem({
                        title: item.description,
                        finalPrice: item.unitPrice
                    });
                }
                // Validate unit price
                if (item.unitPrice <= 0 || isNaN(item.unitPrice)) {
                    throw new Error(`Invalid unit price for item: ${item.description}, unitPrice: ${item.unitPrice}`);
                }
                detailsData.push({
                    type: 'sales_invoice_details',
                    attributes: {
                        quantity: item.quantity || 1,
                        unit_price: item.unitPrice,
                        vat_rate: item.vatRate || 18,
                        discount_type: 'percentage',
                        discount: item.discount || 0,
                        description: item.description
                    },
                    relationships: {
                        product: {
                            data: { type: 'products', id: productId }
                        }
                    }
                });
            }

            // Step 3: Create invoice with details relationship
            // Always set order_date to today if not provided
            const orderDate = invoiceDetails.orderDate || new Date().toISOString().split('T')[0];
            const invoiceData = {
                data: {
                    type: 'sales_invoices',
                    attributes: {
                        item_type: 'invoice',
                        description: invoiceDetails.description || 'Video Content Services',
                        issue_date: invoiceDetails.issueDate || new Date().toISOString().split('T')[0],
                        due_date: invoiceDetails.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        invoice_series: invoiceDetails.invoiceSeries || '',
                        exchange_rate: 1,
                        withholding_rate: 0,
                        vat_withholding_rate: 0,
                        invoice_discount_type: 'percentage',
                        invoice_discount: 0,
                        billing_address: customerInfo.address || this.companyInfo.fullAddress,
                        billing_phone: customerInfo.phone || undefined,
                        billing_fax: customerInfo.fax || undefined,
                        tax_office: customerInfo.taxOffice || this.companyInfo.taxInfo.split('V.NO.')[0].trim(),
                        tax_number: customerInfo.taxNumber || undefined,
                        order_no: invoiceDetails.orderNo || undefined,
                        order_date: orderDate
                    },
                    relationships: {
                        contact: {
                            data: { type: 'contacts', id: contactId }
                        },
                        details: {
                            data: detailsData
                        }
                    }
                }
            };

            // Validate payload
            if (!detailsData.length) {
                throw new Error('Invoice must have at least one detail item.');
            }

            console.log('📋 Creating sales invoice with payload:', JSON.stringify(invoiceData, null, 2));

            const result = await this.makeRequest('POST', '/sales_invoices', invoiceData);
            console.log('✅ Sales invoice created:', result.data.id);

            // Step 4: Add payment for the invoice (if payment info is provided in invoiceDetails)
            let paymentData = null;
            if (invoiceDetails.paymentInfo && invoiceDetails.paymentInfo.isSuccessful) {
                try {
                    paymentData = await this.addPaymentCollection(
                        result.data.id,
                        invoiceDetails.orderNo || result.data.id,
                        invoiceDetails.paymentInfo.amount || invoiceDetails.items.reduce((sum, i) => sum + (i.unitPrice * (i.quantity || 1)), 0)
                    );
                } catch (err) {
                    console.error('❌ Failed to add payment after invoice creation:', err.message);
                }
            }

            // Fetch the invoice with expanded relationships (contact, details.product, payments, payments.transaction)
            const expanded = await this.makeRequest('GET', `/sales_invoices/${result.data.id}?include=contact,details.product,payments,payments.transaction`);
            return expanded.data;
        } catch (error) {
            console.error('❌ Failed to create sales invoice:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Complete Paraşüt invoice workflow
     */
    async createCompleteInvoiceWorkflow(customerInfo, order, paymentInfo, description = 'Video Content Services') {
        try {
            if (!this.isEnabled) {
                return { status: 'disabled', message: 'Paraşüt integration is disabled' };
            }

            console.log('📋 Step 1: Verifying Company Access...');
            await this.makeRequest('GET', '/contacts?page[size]=1');
            console.log('✅ Company access verified');

            console.log('📋 Step 2: Creating/Finding Customer...');
            const contactId = await this.createOrFindContact(customerInfo);

            console.log('📋 Step 3: Preparing Products...');
            const invoiceItems = await this.prepareInvoiceItems(order);

            console.log('📋 Step 4: Creating Sales Invoice...');
            const invoice = await this.createSalesInvoice(customerInfo, {
                description,
                orderNo: order._id.toString(),
                items: invoiceItems
            });

            const invoiceId = invoice.id;
            console.log('✅ Invoice created:', invoiceId);

            if (paymentInfo && paymentInfo.isSuccessful) {
                console.log('📋 Step 5: Adding Payment Collection...');
                await this.addPaymentCollection(
                    invoiceId,
                    order._id.toString(),
                    order.totalPriceForCustomer
                );
            } else {
                console.log('⚠️ Skipping payment collection: Payment not successful or missing');
            }

            console.log('📋 Step 6: Formalizing Invoice...');
            await this.formalizeInvoice(invoiceId, contactId);

            console.log('🎉 Invoice workflow completed!');
            return {
                invoiceId,
                invoiceNumber: invoice.attributes?.invoice_no || 'N/A',
                contactId,
                totalAmount: order.totalPriceForCustomer,
                status: 'completed',
                invoiceDetails: invoice
            };
        } catch (error) {
            console.error('❌ Invoice workflow failed:', error.message);
            throw error;
        }
    }

    /**
     * Create invoice from order data
     */
    async createInvoiceFromOrder(customerInfo, order, description = 'Video Content Services') {
        try {
            const { default: AdditionalServiceModel } = await import('../models/admin/adminAdditionalService.model.js');
            const additionalService = await AdditionalServiceModel.findOne({});
            if (!additionalService) {
                throw new Error('Additional service configuration not found');
            }

            const invoiceItems = [];
            if (order.basePrice && order.noOfUgc) {
                invoiceItems.push({
                    description: `Video Content Services (${order.noOfUgc} UGC)`,
                    quantity: order.noOfUgc,
                    unitPrice: order.basePrice / order.noOfUgc, // Adjusted to per-unit price
                    vatRate: 18,
                    parasutProductId: null
                });
            }

            if (order.additionalServices) {
                const services = order.additionalServices;
                if (services.edit && additionalService.parasut_edit_ID) {
                    invoiceItems.push({
                        description: `Video Editing Service (${order.noOfUgc} UGC)`,
                        quantity: order.noOfUgc,
                        unitPrice: additionalService.editPrice,
                        vatRate: 18,
                        parasutProductId: additionalService.parasut_edit_ID
                    });
                }
                if (services.share && additionalService.parasut_share_ID) {
                    invoiceItems.push({
                        description: `Content Sharing Service (${order.noOfUgc} UGC)`,
                        quantity: order.noOfUgc,
                        unitPrice: additionalService.sharePrice,
                        vatRate: 18,
                        parasutProductId: additionalService.parasut_share_ID
                    });
                }
                if (services.coverPicture && additionalService.parasut_coverPic_ID) {
                    invoiceItems.push({
                        description: `Cover Picture Service (${order.noOfUgc} UGC)`,
                        quantity: order.noOfUgc,
                        unitPrice: additionalService.coverPicPrice,
                        vatRate: 18,
                        parasutProductId: additionalService.parasut_coverPic_ID
                    });
                }
                if (services.creatorType && additionalService.parasut_creatorType_ID) {
                    invoiceItems.push({
                        description: `Creator Type Service (${order.noOfUgc} UGC)`,
                        quantity: order.noOfUgc,
                        unitPrice: additionalService.creatorTypePrice,
                        vatRate: 18,
                        parasutProductId: additionalService.parasut_creatorType_ID
                    });
                }
                if (services.productShipping && additionalService.parasut_shipping_ID) {
                    invoiceItems.push({
                        description: `Product Shipping Service (${order.noOfUgc} UGC)`,
                        quantity: order.noOfUgc,
                        unitPrice: additionalService.shippingPrice,
                        vatRate: 18,
                        parasutProductId: additionalService.parasut_shipping_ID
                    });
                }
                if (services.duration === "30s" && additionalService.parasut_thirtySecond_ID) {
                    invoiceItems.push({
                        description: `30 Second Duration Service (${order.noOfUgc} UGC)`,
                        quantity: order.noOfUgc,
                        unitPrice: additionalService.thirtySecondDurationPrice,
                        vatRate: 18,
                        parasutProductId: additionalService.parasut_thirtySecond_ID
                    });
                } else if (services.duration === "60s" && additionalService.parasut_sixtySecond_ID) {
                    invoiceItems.push({
                        description: `60 Second Duration Service (${order.noOfUgc} UGC)`,
                        quantity: order.noOfUgc,
                        unitPrice: additionalService.sixtySecondDurationPrice,
                        vatRate: 18,
                        parasutProductId: additionalService.parasut_sixtySecond_ID
                    });
                }
            }

            console.log('📋 Invoice items prepared:', JSON.stringify(invoiceItems, null, 2));

            return await this.createSalesInvoice(customerInfo, {
                description,
                orderNo: order._id.toString(),
                items: invoiceItems
            });
        } catch (error) {
            console.error('❌ Failed to create invoice from order:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Add payment collection to an invoice
     */
    async addPaymentCollection(invoiceId, orderId, amount) {
        try {
            // Use hardcoded account ID from env if available, otherwise fallback to default account logic
            const accountId = process.env.PARASUT_PAYMENT_ACCOUNT_ID || await this.getDefaultAccount();
            // Fetch invoice to get remaining amount
            const invoice = await this.makeRequest('GET', `/sales_invoices/${invoiceId}`);
            const remaining = parseFloat(invoice.data.attributes.remaining);
            if (amount > remaining) {
                throw new Error(`Payment amount (${amount}) exceeds invoice remaining (${remaining})`);
            }
            // Use the correct payload structure for Paraşüt /payments endpoint
            const payload = {
                data: {
                    type: 'payments',
                    attributes: {
                        description: `Payment for Order #${orderId}`,
                        account_id: parseInt(accountId, 10),
                        date: new Date().toISOString().split('T')[0],
                        amount: parseFloat(Math.min(amount, remaining)),
                        exchange_rate: 1
                    }
                }
            };

            console.log('📦 Payment Payload:', JSON.stringify(payload, null, 2));
            const response = await this.makeRequest('POST', `/sales_invoices/${invoiceId}/payments`, payload);
            console.log('✅ Payment added:', response.data.id);
            return response.data;
        } catch (error) {
            console.error('❌ Payment error:', error.response?.data || error.message);
            throw new Error(`Failed to add payment for invoice ${invoiceId}. Please verify the account and invoice in Paraşüt: https://uygulama.parasut.com/469071/kasa-ve-bankalar`);
        }
    }

    /**
     * Formalize invoice (e-Invoice or e-Archive)
     */
    async formalizeInvoice(invoiceId, contactId) {
        try {
            const isEInvoiceUser = await this.checkEInvoiceUser(contactId);
            if (isEInvoiceUser) {
                return await this.createEInvoice(invoiceId);
            } else {
                // Fetch the invoice to get order_date
                const invoiceResp = await this.makeRequest('GET', `/sales_invoices/${invoiceId}`);
                let orderDate = invoiceResp.data.attributes?.order_date;
                // Fallback to issue_date or today if missing
                if (!orderDate) {
                    orderDate = invoiceResp.data.attributes?.issue_date || new Date().toISOString().split('T')[0];
                }
                return await this.createEArchive(invoiceId, orderDate);
            }
        } catch (error) {
            console.error('❌ Failed to formalize invoice:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Check if customer is e-Invoice user
     */
    async checkEInvoiceUser(contactId) {
        try {
            const contact = await this.makeRequest('GET', `/contacts/${contactId}`);
            const taxNumber = contact.data.attributes?.tax_number;
            if (!taxNumber) {
                console.log('⚠️ No tax number, defaulting to e-Archive');
                return false;
            }

            const inboxes = await this.makeRequest('GET', `/e_invoice_inboxes?filter[vkn]=${taxNumber}`);
            if (inboxes.data && inboxes.data.length > 0) {
                console.log('✅ Customer is e-Invoice user');
                return true;
            }
            console.log('✅ Customer is e-Archive user');
            return false;
        } catch (error) {
            console.log('⚠️ Error checking e-Invoice status, defaulting to e-Archive:', error.message);
            return false;
        }
    }

    /**
     * Create e-Invoice
     */
    async createEInvoice(invoiceId, advancedFields = {}, userEmail = null) {
        try {
            const attributes = {
                scenario: 'basic',
                to: 'default',
                ...advancedFields
            };
            const eInvoiceData = {
                data: {
                    type: 'e_invoices',
                    attributes,
                    relationships: {
                        sales_invoice: {
                            data: { type: 'sales_invoices', id: invoiceId }
                        }
                    }
                }
            };
            const result = await this.makeRequest('POST', '/e_invoices', eInvoiceData);
            console.log('✅ e-Invoice created:', result.data.id);
            const doc = await this.monitorDocumentProcess(result.data.id, 'e_invoices');
            // Send email if userEmail is provided and document is ready
            if (userEmail && doc) {
                const invoiceNo = doc.attributes?.invoice_no || 'N/A';
                const invoiceUrl = doc.attributes?.print_url || '';
                await sendEmail({
                    to: userEmail,
                    subject: `E-Fatura Oluşturuldu: ${invoiceNo}`,
                    text: `E-Fatura'nız oluşturuldu. Fatura No: ${invoiceNo}\nFaturayı görüntülemek için: ${invoiceUrl}`
                });
            }
            return result.data;
        } catch (error) {
            console.error('❌ Failed to create e-Invoice:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Create e-Archive (supports advanced fields)
     */
    async createEArchive(invoiceId, orderDate, advancedFields = {}, userEmail = null) {
        try {
            if (!orderDate) {
                orderDate = new Date().toISOString().split('T')[0];
            }
            await this.makeRequest('PUT', `/sales_invoices/${invoiceId}`, {
                data: {
                    type: 'sales_invoices',
                    id: invoiceId,
                    attributes: {
                        order_date: orderDate
                    }
                }
            });
            const { internet_sale: advancedInternetSale, ...otherAdvancedFields } = advancedFields;
            const attributes = {
                ...otherAdvancedFields,
                internet_sale: {
                    url: 'https://uzmanlio.com',
                    payment_type: 'CREDIT_CARD',
                    payment_platform: 'VISA',
                    payment_date: orderDate,
                    ...(advancedInternetSale || {})
                }
            }
            const eArchiveData = {
                data: {
                    type: 'e_archives',
                    attributes,
                    relationships: {
                        sales_invoice: {
                            data: { type: 'sales_invoices', id: invoiceId }
                        }
                    }
                }
            };
            const result = await this.makeRequest('POST', '/e_archives', eArchiveData);
            console.log('✅ e-Archive created:', result.data.id);
            const doc = await this.monitorDocumentProcess(result.data.id, 'e_archives');
            // Send email if userEmail is provided and document is ready
            if (userEmail && doc) {
                const invoiceNo = doc.attributes?.invoice_no || 'N/A';
                const invoiceUrl = doc.attributes?.print_url || '';
                await sendEmail({
                    to: userEmail,
                    subject: `E-Arşiv Fatura Oluşturuldu: ${invoiceNo}`,
                    text: `E-Arşiv faturanız oluşturuldu. Fatura No: ${invoiceNo}\nFaturayı görüntülemek için: ${invoiceUrl}`
                });
            }
            return result.data;
        } catch (error) {
            console.error('❌ Failed to create e-Archive:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Monitor e-Invoice/e-Archive creation process (fixed: poll /trackable_jobs/{id} and fetch real document)
     */
    async monitorDocumentProcess(processId, documentType) {
        const maxAttempts = 15; // Increased attempts for longer processes
        const delayMs = 4000;   // Increased delay for processing

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                // Always poll the trackable_jobs endpoint
                const job = await this.makeRequest('GET', `/trackable_jobs/${processId}`);
                const status = job.data.attributes?.status;
                console.log(`📊 trackable_job status (${attempt}/${maxAttempts}): ${status}`);

                if (status === 'done') {
                    const result = job.data.attributes?.result;
                    if (result && result.id) {
                        const doc = await this.makeRequest('GET', `/${documentType}/${result.id}`);
                        console.log(`✅ ${documentType} completed, document id: ${result.id}`);
                        return doc.data;
                    } else {
                        // This is a definitive failure. The job is 'done' but didn't produce the expected document.
                        throw new Error(`Paraşüt job finished successfully but did not return a result ID. Please check the invoice in the Paraşüt UI for potential issues.`);
                    }
                } else if (status === 'error') {
                    const errorDetails = job.data.attributes?.errors?.join(', ') || 'Unknown error';
                    throw new Error(`${documentType} job failed with errors: ${errorDetails}`);
                }
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } catch (error) {
                // Re-throw the error to stop the workflow immediately instead of timing out.
                console.error(`❌ Error during document monitoring (attempt ${attempt}/${maxAttempts}):`, error.message);
                throw error; // This will be caught by the calling function (e.g., createCompleteInvoiceWorkflow)
            }
        }
        throw new Error(`${documentType} monitoring timed out`);
    }

    /**
     * Prepare invoice items from order data
     */
    async prepareInvoiceItems(order) {
        const { default: AdditionalServiceModel } = await import('../models/admin/adminAdditionalService.model.js');
        const additionalService = await AdditionalServiceModel.findOne({});
        if (!additionalService) {
            throw new Error('Additional service configuration not found');
        }

        const invoiceItems = [];
        if (order.basePrice && order.noOfUgc) {
            invoiceItems.push({
                description: `Video Content Services (${order.noOfUgc} UGC)`,
                quantity: order.noOfUgc,
                unitPrice: order.basePrice / order.noOfUgc, // Adjusted to per-unit price
                vatRate: 18,
                parasutProductId: null
            });
        }

        if (order.additionalServices) {
            const services = order.additionalServices;
            if (services.edit && additionalService.parasut_edit_ID) {
                invoiceItems.push({
                    description: `Video Editing Service (${order.noOfUgc} UGC)`,
                    quantity: order.noOfUgc,
                    unitPrice: additionalService.editPrice,
                    vatRate: 18,
                    parasutProductId: additionalService.parasut_edit_ID
                });
            }
            if (services.share && additionalService.parasut_share_ID) {
                invoiceItems.push({
                    description: `Content Sharing Service (${order.noOfUgc} UGC)`,
                    quantity: order.noOfUgc,
                    unitPrice: additionalService.sharePrice,
                    vatRate: 18,
                    parasutProductId: additionalService.parasut_share_ID
                });
            }
            if (services.coverPicture && additionalService.parasut_coverPic_ID) {
                invoiceItems.push({
                    description: `Cover Picture Service (${order.noOfUgc} UGC)`,
                    quantity: order.noOfUgc,
                    unitPrice: additionalService.coverPicPrice,
                    vatRate: 18,
                    parasutProductId: additionalService.parasut_coverPic_ID
                });
            }
            if (services.creatorType && additionalService.parasut_creatorType_ID) {
                invoiceItems.push({
                    description: `Creator Type Service (${order.noOfUgc} UGC)`,
                    quantity: order.noOfUgc,
                    unitPrice: additionalService.creatorTypePrice,
                    vatRate: 18,
                    parasutProductId: additionalService.parasut_creatorType_ID
                });
            }
            if (services.productShipping && additionalService.parasut_shipping_ID) {
                invoiceItems.push({
                    description: `Product Shipping Service (${order.noOfUgc} UGC)`,
                    quantity: order.noOfUgc,
                    unitPrice: additionalService.shippingPrice,
                    vatRate: 18,
                    parasutProductId: additionalService.parasut_shipping_ID
                });
            }
            if (services.duration === "30s" && additionalService.parasut_thirtySecond_ID) {
                invoiceItems.push({
                    description: `30 Second Duration Service (${order.noOfUgc} UGC)`,
                    quantity: order.noOfUgc,
                    unitPrice: additionalService.thirtySecondDurationPrice,
                    vatRate: 18,
                    parasutProductId: additionalService.parasut_thirtySecond_ID
                });
            } else if (services.duration === "60s" && additionalService.parasut_sixtySecond_ID) {
                invoiceItems.push({
                    description: `60 Second Duration Service (${order.noOfUgc} UGC)`,
                    quantity: mainInvoiceItem.quantity,
                    unitPrice: additionalService.sixtySecondDurationPrice,
                    vatRate: 18,
                    parasutProductId: additionalService.parasut_sixtySecond_ID
                });
            }
        }

        console.log('📦 Prepared invoice items:', JSON.stringify(invoiceItems, null, 2));
        return invoiceItems;
    }

    /**
     * Create simple invoice with total price
     */
    async createSimpleInvoice(customerInfo, totalPriceForCustomer, description = 'Video Content Services') {
        const invoiceItems = [
            {
                description,
                quantity: 1,
                unitPrice: totalPriceForCustomer,
                vatRate: 18,
                parasutProductId: null
            }
        ];
        return await this.createSalesInvoice(customerInfo, {
            description,
            items: invoiceItems
        });
    }
}

export default new ParasutApiService();