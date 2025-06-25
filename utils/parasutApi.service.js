import axios from 'axios';
import dotenv from 'dotenv';
import retry from 'async-retry';

dotenv.config();

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
                if (this.refreshToken) {
                    this.refreshAccessToken()
                        .then(() => {
                            console.log('✅ Token refreshed successfully in loadStoredTokens');
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
        if (!this.refreshToken) {
            throw new Error('No refresh token available. Please re-authenticate using Authorization Code Grant.');
        }

        try {
            console.log('🔄 Refreshing Paraşüt access token...');
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

            this.storeTokens(response.data); // This will update accessToken, refreshToken, expiry, and process.env
            console.log('✅ Token refreshed successfully');
            return response.data;
        } catch (error) {
            console.error('❌ Token refresh failed:', error.response?.data?.error_description || error.message);
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
     * Make authenticated API request
     */
    async makeRequest(method, endpoint, data = null) {
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
        // Use the accounts endpoint without filter
        const response = await this.makeRequest('GET', '/accounts');

        // Log full response for debugging
        console.log('API Response:', JSON.stringify(response, null, 2));

        // Check if data is returned
        if (response.data && response.data.length > 0) {
            // Prefer bank account, fallback to cash
            const account = response.data.find(acc => acc.attributes.account_type === 'bank') ||
                           response.data.find(acc => acc.attributes.account_type === 'cash') ||
                           response.data[0];
            if (!account) {
                throw new Error('No suitable bank or cash accounts found in Paraşüt.');
            }
            console.log('✅ Found default account:', account.id, account.attributes.name);
            return account.id;
        }
        throw new Error('No accounts found in Paraşüt. Please configure an account in the Paraşüt dashboard.');
    } catch (error) {
        console.error('❌ Failed to fetch accounts:', error.response?.data || error.message);
        throw new Error(
            'Failed to retrieve default account. Please configure a bank or cash account in Paraşüt: https://uygulama.parasut.com/469071/kasa-ve-bankalar'
        );
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
                city: customerInfo.city || undefined,
                district: customerInfo.district || undefined,
                phone: customerInfo.phone || undefined,
                fax: customerInfo.fax || undefined
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
            const details = [];
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
                details.push({
                    product_id: productId,
                    quantity: item.quantity || 1,
                    unit_price: item.unitPrice,
                    vat_rate: item.vatRate || 18,
                    discount_type: 'percentage',
                    discount: item.discount || 0,
                    description: item.description
                });
            }

            // Step 3: Create invoice
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
                        order_date: invoiceDetails.orderDate || undefined,
                        details // <-- Correct Paraşüt API expects line items here
                    },
                    relationships: {
                        contact: {
                            data: { type: 'contacts', id: contactId }
                        }
                    }
                }
            };

            // Validate payload
            if (!invoiceData.data.attributes.details || !Array.isArray(invoiceData.data.attributes.details) || invoiceData.data.attributes.details.length === 0) {
                throw new Error('Invoice must have at least one detail item.');
            }

            console.log('📋 Creating sales invoice with payload:', JSON.stringify(invoiceData, null, 2));

            const result = await this.makeRequest('POST', '/sales_invoices', invoiceData);
            console.log('✅ Sales invoice created:', result.data.id);
            return result.data;
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

            // Verify company access
            await this.makeRequest('GET', '/contacts?page[size]=1');
            console.log('✅ Company access verified');

            // Step 1: Create customer
            console.log('📋 Step 1: Creating/Finding Customer...');
            const contactId = await this.createOrFindContact(customerInfo);

            // Step 2: Prepare products
            console.log('📋 Step 2: Preparing Products...');
            const invoiceItems = await this.prepareInvoiceItems(order);

            // Step 3: Create invoice
            console.log('📋 Step 3: Creating Sales Invoice...');
            const invoice = await this.createSalesInvoice(customerInfo, {
                description,
                orderNo: order._id.toString(),
                items: invoiceItems
            });

            const invoiceId = invoice.id;
            console.log('✅ Invoice created:', invoiceId);

            // Step 4: Add payment collection
            if (paymentInfo && paymentInfo.isSuccessful) {
                console.log('📋 Step 4: Adding Payment Collection...');
                await this.addPaymentCollection(invoiceId, paymentInfo);
            }

            // Step 5: Formalize invoice
            console.log('📋 Step 5: Formalizing Invoice...');
            await this.formalizeInvoice(invoiceId, contactId);

            console.log('🎉 Invoice workflow completed!');
            return {
                invoiceId,
                invoiceNumber: invoice.attributes?.invoice_no,
                contactId,
                totalAmount: order.totalPriceForCustomer,
                status: 'completed'
            };
        } catch (error) {
            console.error('❌ Invoice workflow failed:', error.response?.data || error.message);
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
     * Add payment collection to invoice
     */
    // async addPaymentCollection(invoiceId, paymentInfo) {
    //     try {
    //         const collectionData = {
    //             data: {
    //                 type: 'payments',
    //                 attributes: {
    //                     date: paymentInfo.date || new Date().toISOString().split('T')[0],
    //                     amount: paymentInfo.amount,
    //                     currency: paymentInfo.currency || 'TRY',
    //                     exchange_rate: paymentInfo.exchangeRate || 1,
    //                     description: paymentInfo.description || 'Online Payment'
    //                 },
    //                 relationships: {
    //                     payable: {
    //                         data: { type: 'sales_invoices', id: invoiceId }
    //                     }
    //                 }
    //             }
    //         };

    //         // FIX: Use correct endpoint for payment collection
    //         const result = await this.makeRequest('POST', `/sales_invoices/${invoiceId}/payments`, collectionData);
    //         console.log('✅ Payment collection added:', result.data.id);
    //         return result.data;
    //     } catch (error) {
    //         console.error('❌ Failed to add payment collection:', error.response?.data || error.message);
    //         throw error;
    //     }
    // }


    /**
     * Add payment collection to invoice
     */
    // async addPaymentCollection(invoiceId, paymentInfo) {
    //     try {
    //         // Fetch default account
    //         const accountId = await this.getDefaultAccount();

    //         const collectionData = {
    //             data: {
    //                 type: 'payments',
    //                 attributes: {
    //                     date: paymentInfo.date || new Date().toISOString().split('T')[0],
    //                     amount: paymentInfo.amount,
    //                     currency: paymentInfo.currency || 'TRY',
    //                     exchange_rate: paymentInfo.exchangeRate || 1,
    //                     description: paymentInfo.description || 'Online Payment'
    //                 },
    //                 relationships: {
    //                     payable: {
    //                         data: { type: 'sales_invoices', id: invoiceId }
    //                     },
    //                     account: {
    //                         data: { type: 'accounts', id: accountId }
    //                     }
    //                 }
    //             }
    //         };

    //         const result = await this.makeRequest('POST', `/sales_invoices/${invoiceId}/payments`, collectionData);
    //         console.log('✅ Payment collection added:', result.data.id);
    //         return result.data;
    //     } catch (error) {
    //         console.error('❌ Failed to add payment collection:', error.response?.data || error.message);
    //         throw error;
    //     }
    // }

    


    /**
     * Formalize invoice (e-Invoice or e-Archive)
     */
    async formalizeInvoice(invoiceId, contactId) {
        try {
            const isEInvoiceUser = await this.checkEInvoiceUser(contactId);
            if (isEInvoiceUser) {
                console.log('📋 Creating e-Invoice...');
                return await this.createEInvoice(invoiceId);
            } else {
                console.log('📋 Creating e-Archive...');
                return await this.createEArchive(invoiceId);
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
    async createEInvoice(invoiceId) {
        try {
            const eInvoiceData = {
                data: {
                    type: 'e_invoices',
                    attributes: {
                        scenario: 'basic', // Required for e-Invoice
                        to: 'default' // Required for e-Invoice recipient
                    },
                    relationships: {
                        sales_invoice: {
                            data: { type: 'sales_invoices', id: invoiceId }
                        }
                    }
                }
            };

            const result = await this.makeRequest('POST', '/e_invoices', eInvoiceData);
            console.log('✅ e-Invoice created:', result.data.id);
            await this.monitorDocumentProcess(result.data.id, 'e_invoices');
            return result.data;
        } catch (error) {
            console.error('❌ Failed to create e-Invoice:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Create e-Archive
     */
    async createEArchive(invoiceId) {
        try {
            const eArchiveData = {
                data: {
                    type: 'e_archives',
                    attributes: {
                        internet_sale: {
                            url: 'https://uzmanlio.com', // Required for e-Archive
                            payment_type: 'CREDIT_CARD', // Example: adjust based on payment
                            payment_platform: 'Online',
                            payment_date: new Date().toISOString().split('T')[0]
                        }
                    },
                    relationships: {
                        sales_invoice: {
                            data: { type: 'sales_invoices', id: invoiceId }
                        }
                    }
                }
            };

            const result = await this.makeRequest('POST', '/e_archives', eArchiveData);
            console.log('✅ e-Archive created:', result.data.id);
            await this.monitorDocumentProcess(result.data.id, 'e_archives');
            return result.data;
        } catch (error) {
            console.error('❌ Failed to create e-Archive:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Monitor e-Invoice/e-Archive creation process
     */
    async monitorDocumentProcess(processId, documentType) {
        const maxAttempts = 10;
        const delayMs = 3000;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const process = await this.makeRequest('GET', `/${documentType}/${processId}`);
                const status = process.data.attributes?.status;
                console.log(`📊 ${documentType} status (${attempt}/${maxAttempts}): ${status}`);

                if (status === 'done') {
                    console.log(`✅ ${documentType} completed`);
                    return process.data;
                } else if (status === 'error') {
                    throw new Error(`${documentType} failed`);
                }
                await new Promise(resolve => setTimeout(resolve, delayMs));
            } catch (error) {
                console.error(`❌ Error monitoring ${documentType}:`, error.message);
                if (attempt === maxAttempts) {
                    throw error;
                }
                await new Promise(resolve => setTimeout(resolve, delayMs));
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
                    quantity: order.noOfUgc,
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

// For CommonJS compatibility (Node.js):
// module.exports = new ParasutApiService();
// If using ES Modules, comment out the above and use:
export default new ParasutApiService();
