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
    creatorRejectionForOrder: () => {},

    creatorRegistrationByAdmin: () => {},
    creatorApproval: () => {},
    creatorRejection: () => {},
    orderCreationByCustomer: () => {},
    orderCreationByAdmin: () => {},
};
