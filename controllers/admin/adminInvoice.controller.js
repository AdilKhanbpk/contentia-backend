import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";
import parasutApiService from "../../utils/parasutApi.service.js";

/**
 * Create a simple invoice in Paraşüt with customer info and total price
 */
const createSimpleInvoice = asyncHandler(async (req, res) => {
    const {
        // Customer Information
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        customerCity,
        customerDistrict,
        customerTaxNumber,
        customerTaxOffice,
        customerCompanyName,
        customerContactType, // 'person' or 'company'
        
        // Invoice Information
        totalPriceForCustomer,
        description,
        orderNo,
        invoiceSeries,
        issueDate,
        dueDate
    } = req.body;

    // Validate required fields
    if (!totalPriceForCustomer || totalPriceForCustomer <= 0) {
        throw new ApiError(400, "Total price for customer is required and must be greater than 0");
    }

    if (!customerName && !customerCompanyName) {
        throw new ApiError(400, "Customer name or company name is required");
    }

    try {
        // Prepare customer information
        const customerInfo = {
            name: customerName || customerCompanyName,
            companyName: customerCompanyName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress,
            city: customerCity,
            district: customerDistrict,
            taxNumber: customerTaxNumber,
            taxOffice: customerTaxOffice,
            contactType: customerContactType || (customerCompanyName ? 'company' : 'person')
        };

        // Create simple invoice
        const invoice = await parasutApiService.createSimpleInvoice(
            customerInfo,
            totalPriceForCustomer,
            description || 'Video Content Services'
        );

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    {
                        invoiceId: invoice.id,
                        invoiceNumber: invoice.attributes?.invoice_no,
                        totalAmount: totalPriceForCustomer,
                        customerInfo: customerInfo,
                        parasutInvoiceData: invoice
                    },
                    "Invoice created successfully in Paraşüt"
                )
            );
    } catch (error) {
        console.error('Failed to create invoice in Paraşüt:', error);
        throw new ApiError(500, `Failed to create invoice: ${error.message}`);
    }
});

/**
 * Create a detailed invoice in Paraşüt with multiple items
 */
const createDetailedInvoice = asyncHandler(async (req, res) => {
    const {
        // Customer Information
        customerInfo,
        
        // Invoice Details
        invoiceDetails
    } = req.body;

    // Validate required fields
    if (!customerInfo || (!customerInfo.name && !customerInfo.companyName)) {
        throw new ApiError(400, "Customer information with name or company name is required");
    }

    if (!invoiceDetails || !invoiceDetails.items || invoiceDetails.items.length === 0) {
        throw new ApiError(400, "Invoice details with at least one item is required");
    }

    // Validate each item
    for (const item of invoiceDetails.items) {
        if (!item.description || !item.unitPrice || item.unitPrice <= 0) {
            throw new ApiError(400, "Each item must have description and unit price greater than 0");
        }
    }

    try {
        // Create detailed invoice
        const invoice = await parasutApiService.createSalesInvoice(customerInfo, invoiceDetails);

        // Calculate total amount
        const totalAmount = invoiceDetails.items.reduce((sum, item) => {
            const quantity = item.quantity || 1;
            const unitPrice = item.unitPrice;
            const discount = item.discount || 0;
            const vatRate = item.vatRate || 18;
            
            const subtotal = quantity * unitPrice * (1 - discount / 100);
            const total = subtotal * (1 + vatRate / 100);
            return sum + total;
        }, 0);

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    {
                        invoiceId: invoice.id,
                        invoiceNumber: invoice.attributes?.invoice_no,
                        totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
                        itemCount: invoiceDetails.items.length,
                        customerInfo: customerInfo,
                        parasutInvoiceData: invoice
                    },
                    "Detailed invoice created successfully in Paraşüt"
                )
            );
    } catch (error) {
        console.error('Failed to create detailed invoice in Paraşüt:', error);
        throw new ApiError(500, `Failed to create detailed invoice: ${error.message}`);
    }
});

/**
 * Create invoice from order data (convenience method for existing orders)
 */
const createInvoiceFromOrder = asyncHandler(async (req, res) => {
    const { orderId } = req.params;
    const {
        customerInfo,
        totalPriceForCustomer,
        orderDetails
    } = req.body;

    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }

    if (!totalPriceForCustomer || totalPriceForCustomer <= 0) {
        throw new ApiError(400, "Total price for customer is required and must be greater than 0");
    }

    if (!customerInfo || (!customerInfo.name && !customerInfo.companyName)) {
        throw new ApiError(400, "Customer information is required");
    }

    try {
        // Create invoice with order reference
        const invoice = await parasutApiService.createSimpleInvoice(
            customerInfo,
            totalPriceForCustomer,
            `Order #${orderId} - Video Content Services`
        );

        return res
            .status(201)
            .json(
                new ApiResponse(
                    201,
                    {
                        orderId: orderId,
                        invoiceId: invoice.id,
                        invoiceNumber: invoice.attributes?.invoice_no,
                        totalAmount: totalPriceForCustomer,
                        customerInfo: customerInfo,
                        parasutInvoiceData: invoice
                    },
                    `Invoice created successfully for order #${orderId}`
                )
            );
    } catch (error) {
        console.error('Failed to create invoice from order:', error);
        throw new ApiError(500, `Failed to create invoice from order: ${error.message}`);
    }
});

export {
    createSimpleInvoice,
    createDetailedInvoice,
    createInvoiceFromOrder
};
