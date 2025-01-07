export const notificationTemplates = {
    creatorRegistration: ({
        creatorName,
        creatorEmail,
        creatorPhoneNumber,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "Creator Registration",
            details: `A new creator with name ${creatorName}, email ${creatorEmail} and phone no ${creatorPhoneNumber}  has registered`,
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
            title: "Creator Apply For Order",
            details: `A creator with name ${creatorName}, email ${creatorEmail} and phone no ${creatorPhoneNumber} has applied for an order`,
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
            title: "Creator Approval For Order By Admin",
            details: `A creator with name ${creatorName}, email ${creatorEmail} and phone no ${creatorPhoneNumber} has been approved for an order`,
            userType: "creator",
            eventType: "creator",
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
            title: "Creator Rejection For Order",
            details: `A creator with name ${creatorName}, email ${creatorEmail} and phone no ${creatorPhoneNumber} has been rejected for an order`,
            userType: "creator",
            eventType: "creator",
            users: targetUsers,
            metadata,
        };
    },
    creatorRegistrationByAdmin: ({
        creatorName,
        creatorEmail,
        creatorPhoneNumber,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "Creator Registration By Admin",
            details: `A new creator with name ${creatorName}, email ${creatorEmail} and phone no ${creatorPhoneNumber} has been registered by admin`,
            userType: "creator",
            eventType: "creator",
            users: targetUsers,
            metadata,
        };
    },
    creatorApproval: ({
        creatorName,
        creatorEmail,
        creatorPhoneNumber,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "Creator Approval",
            details: `A creator with name ${creatorName}, email ${creatorEmail} and phone no ${creatorPhoneNumber} has been approved by admin`,
            userType: "creator",
            eventType: "creator",
            users: targetUsers,
            metadata,
        };
    },
    creatorRejection: ({
        creatorName,
        creatorEmail,
        creatorPhoneNumber,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "Creator Rejection",
            details: `A creator with name ${creatorName}, email ${creatorEmail} and phone no ${creatorPhoneNumber} has been rejected by admin`,
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
            title: "Order Creation By Customer",
            details: `A new order has been created by customer with name ${customerName}, email ${customerEmail} and phone no ${customerPhoneNumber}`,
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
            title: "Order Creation By Admin",
            details: `A new order has been created by admin with name ${customerName}, email ${customerEmail} and phone no ${customerPhoneNumber}`,
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
            title: "Report An Order From Customer",
            details: `An order has been reported by customer with name ${customerName}, email ${customerEmail} and phone no ${customerPhoneNumber}`,
            userType: "customer",
            eventType: "admin",
            users: targetUsers,
            metadata,
        };
    },
    packageCreationByAdmin: ({
        customerName,
        customerEmail,
        customerPhoneNumber,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "Package Creation By Admin",
            details: `A new package has been created by admin with name ${customerName}, email ${customerEmail} and phone no ${customerPhoneNumber}`,
            userType: "customer",
            eventType: "admin",
            users: targetUsers,
            metadata,
        };
    },
};
