export const notificationTemplates = {
    creatorRegistration: ({
        creatorName,
        creatorEmail,
        creatorPhoneNumber,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "New Creator Registration",
            details: `A new creator has successfully registered. Details:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
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
            details: `A creator has applied for an order. Details:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
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
            details: `The following creator has been approved for an order:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
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
            title: "Order Rejection Notification",
            details: `The following creator has been rejected for an order:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
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
            title: "Admin-Initiated Creator Registration",
            details: `An admin has registered a new creator. Details:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
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
            title: "Creator Approval Notification",
            details: `The following creator has been approved by an admin:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
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
            title: "Creator Rejection Notification",
            details: `The following creator has been rejected by an admin:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
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
            details: `A customer has created a new order. Details:\nName: ${customerName}\nEmail: ${customerEmail}\nPhone Number: ${customerPhoneNumber}`,
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
            details: `An admin has created a new order on behalf of a customer. Details:\nCustomer Name: ${customerName}\nCustomer Email: ${customerEmail}\nCustomer Phone Number: ${customerPhoneNumber}`,
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
            title: "Order Issue Reported",
            details: `A customer has reported an issue with an order. Details:\nName: ${customerName}\nEmail: ${customerEmail}\nPhone Number: ${customerPhoneNumber}`,
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
            title: "New Package Created",
            details: `A new package has been created by an admin. Customer Details:\nName: ${customerName}\nEmail: ${customerEmail}\nPhone Number: ${customerPhoneNumber}`,
            userType: "customer",
            eventType: "admin",
            users: targetUsers,
            metadata,
        };
    },
};
