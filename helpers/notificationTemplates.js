

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
            details: `${details}`,
            userType,
            eventType,
            users: targetUsers,
            metadata,
        };
    },

    creatorRegistration: ({
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "New Creator Registration",
            details: `A new creator named ${metadata.creatorName} has successfully registered with the email ${metadata.creatorEmail} and phone number ${metadata.creatorPhoneNumber}.`,
            userType: "customer",
            eventType: "admin",
            users: targetUsers,
            metadata,
        };
    },

    creatorApplyForOrder: ({
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
        orderTitle = "Order Title",
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: " Başvurun Onaylandı!",
            details: ` ${orderTitle} başvurun Onaylandı, siparişlerim sayfasında görüntüleyebilir içerik üretmeye başlayabilirsin.`,
            userType: "creator",
            eventType: "creator",
            users: targetUsers,
            metadata,
        };
    },

    adminCustomPackageCreationToCustomer: ({
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "Yeni Paket Oluşturuldu",
            details: `Aşağıdaki ayrıntılarla yeni bir paket oluşturuldu: ${metadata.packageId}`,
            userType: "customer",
            eventType: "admin",
            users: targetUsers,
            metadata,
        }
    },

    // customerNotificationForOrderAssignedToCreator: ({
    //     creatorName,
    //     creatorEmail,
    //     creatorPhoneNumber,
    //     targetUsers = [],
    //     metadata = {},
    // }) => {
    //     return {
    //         title: "Order Assigned Notification",
    //         details: `Your order has been assigned to creator ${creatorName}, who can be reached via email at ${creatorEmail} and phone number ${creatorPhoneNumber}.`,
    //         userType: "customer",
    //         eventType: "customer",
    //         users: targetUsers,
    //         metadata,
    //     };
    // },

    creatorRejectionForOrder: ({
        orderTitle = "Order Title",
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "Başvuru Reddedildi!",
            details: ` ${orderTitle} başvurun marka kriterlerini karşılamadığından reddedildi, yeni iş ilanlarına göz at!`,
            userType: "creator",
            eventType: "creator",
            users: targetUsers,
            metadata,
        };
    },

    orderCreationByCustomer: ({
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: "Yeni Bir İş İlanı Eklendi!",
            details: `Bir marka yeni bir sipariş oluşturdu! Tüm ilanlara hemen göz at!`,
            userType: "customer",
            eventType: "admin",
            users: targetUsers,
            metadata,
        };
    },

    reportAnOrderFromCustomer: ({
        orderTitle,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: " Revizyon Talebi Alındı!",
            details: `${orderTitle} siparişin için revizyon talebi alındı. `,
            userType: "customer",
            eventType: "admin",
            users: targetUsers,
            metadata,
        };
    },

    orderCreationByAdminForCustomer: ({
        orderTitle = "Admin Order",
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: " Revizyon Talebi Alındı!",
            details: `${orderTitle} siparişin için revizyon talebi alındı. `,
            userType: "customer",
            eventType: "admin",
            users: targetUsers,
            metadata,
        };
    },

    orderCompletionByCreator: ({
        orderTitle,
        targetUsers = [],
        metadata = {},
    }) => {
        return {
            title: " Siparişin Tamamlandı!",
            details: ` ${orderTitle} siparişin tamamlandı.`,
            userType: "customer",
            eventType: "customer",
            users: targetUsers,
            metadata,
        };
    },

};
