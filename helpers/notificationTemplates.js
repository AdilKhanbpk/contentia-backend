

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
            title: "Yeni İçerik Üreticisi Kaydı",
            details: `Yeni bir içerik üreticisi olan ${metadata.creatorName}, ${metadata.creatorEmail} e-posta adresi ve ${metadata.creatorPhoneNumber} telefon numarası ile başarıyla kayıt oldu.`,
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
        const { creatorName, creatorEmail, creatorPhoneNumber } = metadata;

        return {
            title: "İçerik Üreticisi Siparişe Başvurdu",
            details: `İçerik üreticisi ${creatorName}, ${creatorEmail} e-posta adresi ve ${creatorPhoneNumber} telefon numarası ile bir siparişe başvurdu.`,
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
