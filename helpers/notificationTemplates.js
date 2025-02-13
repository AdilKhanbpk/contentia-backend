// export const notificationTemplates = {
//     generalNotification: ({
//         adminName,
//         title,
//         details,
//         userType = "all",
//         eventType = "general",
//         targetUsers = [],
//         metadata = {},
//     }) => {
//         return {
//             title,
//             details: `This is a general notification from admin ${adminName} with the following details: ${details}`,
//             userType,
//             eventType,
//             users: targetUsers,
//             metadata,
//         };
//     },
//     creatorRegistration: ({
//         creatorName,
//         creatorEmail,
//         creatorPhoneNumber,
//         targetUsers = [],
//         metadata = {},
//     }) => {
//         return {
//             title: "New Creator Registration",
//             details: `A new creator has successfully registered. Details:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
//             userType: "customer",
//             eventType: "admin",
//             users: targetUsers,
//             metadata,
//         };
//     },

//     creatorApplyForOrder: ({
//         creatorName,
//         creatorEmail,
//         creatorPhoneNumber,
//         targetUsers = [],
//         metadata = {},
//     }) => {
//         return {
//             title: "Creator Application for Order",
//             details: `A creator has applied for an order. Details:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
//             userType: "customer",
//             eventType: "admin",
//             users: targetUsers,
//             metadata,
//         };
//     },

//     creatorApprovalForOrderByAdmin: ({
//         creatorName,
//         creatorEmail,
//         creatorPhoneNumber,
//         targetUsers = [],
//         metadata = {},
//     }) => {
//         return {
//             title: "Order Approval Notification",
//             details: `The following creator has been approved for an order:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
//             userType: "creator",
//             eventType: "creator",
//             users: targetUsers,
//             metadata,
//         };
//     },

//     customerNotificationForOrderAssignedToCreator: ({
//         creatorName,
//         creatorEmail,
//         creatorPhoneNumber,
//         targetUsers = [],
//         metadata = {},
//     }) => {
//         return {
//             title: "Order Assigned Notification",
//             details: `The following creator has been assigned to your order:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
//             userType: "customer",
//             eventType: "customer",
//             users: targetUsers,
//             metadata,
//         };
//     },

//     creatorRejectionForOrder: ({
//         creatorName,
//         creatorEmail,
//         creatorPhoneNumber,
//         targetUsers = [],
//         metadata = {},
//     }) => {
//         return {
//             title: "Order Rejection Notification",
//             details: `The following creator has been rejected for an order:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
//             userType: "creator",
//             eventType: "creator",
//             users: targetUsers,
//             metadata,
//         };
//     },
//     creatorRegistrationByAdmin: ({
//         creatorName,
//         creatorEmail,
//         creatorPhoneNumber,
//         targetUsers = [],
//         metadata = {},
//     }) => {
//         return {
//             title: "Admin-Initiated Creator Registration",
//             details: `An admin has registered a new creator. Details:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
//             userType: "creator",
//             eventType: "creator",
//             users: targetUsers,
//             metadata,
//         };
//     },
//     creatorApproval: ({
//         creatorName,
//         creatorEmail,
//         creatorPhoneNumber,
//         targetUsers = [],
//         metadata = {},
//     }) => {
//         return {
//             title: "Creator Approval Notification",
//             details: `The following creator has been approved by an admin:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
//             userType: "creator",
//             eventType: "creator",
//             users: targetUsers,
//             metadata,
//         };
//     },
//     creatorRejection: ({
//         creatorName,
//         creatorEmail,
//         creatorPhoneNumber,
//         targetUsers = [],
//         metadata = {},
//     }) => {
//         return {
//             title: "Creator Rejection Notification",
//             details: `The following creator has been rejected by an admin:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
//             userType: "creator",
//             eventType: "creator",
//             users: targetUsers,
//             metadata,
//         };
//     },
//     orderCreationByCustomer: ({
//         customerName,
//         customerEmail,
//         customerPhoneNumber,
//         targetUsers = [],
//         metadata = {},
//     }) => {
//         return {
//             title: "New Order Created",
//             details: `A customer has created a new order. Details:\nName: ${customerName}\nEmail: ${customerEmail}\nPhone Number: ${customerPhoneNumber}`,
//             userType: "customer",
//             eventType: "admin",
//             users: targetUsers,
//             metadata,
//         };
//     },
//     orderCreationByAdminForCustomer: ({
//         customerName,
//         customerEmail,
//         customerPhoneNumber,
//         targetUsers = [],
//         metadata = {},
//     }) => {
//         return {
//             title: "Order Created by Admin",
//             details: `An admin has created a new order on behalf of a customer. Details:\nCustomer Name: ${customerName}\nCustomer Email: ${customerEmail}\nCustomer Phone Number: ${customerPhoneNumber}`,
//             userType: "customer",
//             eventType: "admin",
//             users: targetUsers,
//             metadata,
//         };
//     },

//     reportAnOrderFromCustomer: ({
//         customerName,
//         customerEmail,
//         customerPhoneNumber,
//         targetUsers = [],
//         metadata = {},
//     }) => {
//         return {
//             title: "Order Issue Reported",
//             details: `A customer has reported an issue with an order. Details:\nName: ${customerName}\nEmail: ${customerEmail}\nPhone Number: ${customerPhoneNumber}`,
//             userType: "customer",
//             eventType: "admin",
//             users: targetUsers,
//             metadata,
//         };
//     },
//     reportAnOrderFromAdmin: ({
//         creatorName,
//         creatorEmail,
//         creatorPhoneNumber,
//         targetUsers = [],
//         metadata = {},
//     }) => {
//         return {
//             title: "Order Issue Reported by Admin",
//             details: `An admin has reported an issue with an order. Details:\nName: ${creatorName}\nEmail: ${creatorEmail}\nPhone Number: ${creatorPhoneNumber}`,
//             userType: "creator",
//             eventType: "creator",
//             users: targetUsers,
//             metadata,
//         };
//     },

//     packageCreationByAdmin: ({
//         customerName,
//         customerEmail,
//         customerPhoneNumber,
//         targetUsers = [],
//         metadata = {},
//     }) => {
//         return {
//             title: "New Package Created",
//             details: `A new package has been created by an admin. Customer Details:\nName: ${customerName}\nEmail: ${customerEmail}\nPhone Number: ${customerPhoneNumber}`,
//             userType: "customer",
//             eventType: "admin",
//             users: targetUsers,
//             metadata,
//         };
//     },
// };

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
