

export const notificationTemplates = {
    generalNotification: ({
        adminName,
        title,
        details,
        userType = "all",
        eventType = "general",
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title,
            details: `Admin ${adminName} has sent a general notification with the following message: ${details}`,
            userType,
            eventType,
            users: targetUsers,
            metadata,
        };
    },
    creatorRegistration: ({
        creatorName,
        creatorEmail,
        creatorPhoneNumber,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "New Creator Registration",
            details: `A new creator named ${creatorName} has successfully registered with the email ${creatorEmail} and phone number ${creatorPhoneNumber}.`,
            userType: "customer",
            eventType: "admin",
            users: targetUsers,
            metadata,
        };
    },

    creatorApplyForOrder: ({
        creatorName,
        creatorEmail,
        creatorPhoneNumber,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "Creator Application for Order",
            details: `Creator ${creatorName} has applied for an order using the email ${creatorEmail} and phone number ${creatorPhoneNumber}.`,
            userType: "customer",
            eventType: "admin",
            users: targetUsers,
            metadata,
        };
    },

    creatorApprovalForOrderByAdmin: ({
        creatorName,
        creatorEmail,
        creatorPhoneNumber,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "Order Approval Notification",
            details: `The creator ${creatorName} has been approved for an order. Their contact details are email: ${creatorEmail} and phone number: ${creatorPhoneNumber}.`,
            userType: "creator",
            eventType: "creator",
            users: targetUsers,
            metadata,
        };
    },

    customerNotificationForOrderAssignedToCreator: ({
        creatorName,
        creatorEmail,
        creatorPhoneNumber,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "Order Assigned Notification",
            details: `Your order has been assigned to creator ${creatorName}, who can be reached via email at ${creatorEmail} and phone number ${creatorPhoneNumber}.`,
            userType: "customer",
            eventType: "customer",
            users: targetUsers,
            metadata,
        };
    },

    creatorRejectionForOrder: ({
        creatorName,
        creatorEmail,
        creatorPhoneNumber,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "Order Rejection Notification",
            details: `The creator ${creatorName} has been rejected for the order. Their email is ${creatorEmail}, and their phone number is ${creatorPhoneNumber}.`,
            userType: "creator",
            eventType: "creator",
            users: targetUsers,
            metadata,
        };
    },

    orderCreationByCustomer: ({
        customerName,
        customerEmail,
        customerPhoneNumber,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "New Order Created",
            details: `A new order has been placed by customer ${customerName}, who can be contacted at ${customerEmail} or phone number ${customerPhoneNumber}.`,
            userType: "customer",
            eventType: "admin",
            users: targetUsers,
            metadata,
        };
    },
    reportAnOrderFromCustomer: ({
        customerName,
        customerEmail,
        customerPhoneNumber,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "New Order Created",
            details: `A new order has been placed by customer ${customerName}, who can be contacted at ${customerEmail} or phone number ${customerPhoneNumber}.`,
            userType: "customer",
            eventType: "admin",
            users: targetUsers,
            metadata,
        };
    },

    orderCreationByAdminForCustomer: ({
        customerName,
        customerEmail,
        customerPhoneNumber,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "Order Created by Admin",
            details: `An admin has placed an order on behalf of customer ${customerName}. The customer's email is ${customerEmail}, and their phone number is ${customerPhoneNumber}.`,
            userType: "customer",
            eventType: "admin",
            users: targetUsers,
            metadata,
        };
    },
};
