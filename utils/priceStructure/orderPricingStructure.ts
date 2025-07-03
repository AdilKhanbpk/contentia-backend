type AdditionalServiceOptions = {
    edit?: boolean;
    share?: boolean;
    coverPicture?: boolean;
    creatorType?: boolean;
    productShipping?: boolean;
    duration?: "30s" | "60s" | null;
};

type PriceBreakdown = {
    totalCustomerPrice: number;
    totalCreatorEarnings: number;
    perCreatorEarning: number;
    platformRevenue: number;
};

export const calculateOrderPricing = (
    numberOfUGCs: number,
    basePricePerUGC: number,
    selectedServices: AdditionalServiceOptions,
    servicePrices: {
        editPrice: number;
        sharePrice: number;
        coverPicPrice: number;
        creatorTypePrice: number;
        shippingPrice: number;
        thirtySecondDurationPrice: number;
        sixtySecondDurationPrice: number;
    }
): PriceBreakdown => {
    const baseTotal = basePricePerUGC * numberOfUGCs;

    let creatorEarnings = baseTotal / 2;
    let platformRevenue = baseTotal / 2;
    let totalCustomerPrice = baseTotal;

    // 50-50 shared services
    const half = (amount: number) => amount / 2;

    if (selectedServices.edit) {
        const total = servicePrices.editPrice * numberOfUGCs;
        totalCustomerPrice += total;
        creatorEarnings += half(total);
        platformRevenue += half(total);
    }

    if (selectedServices.coverPicture) {
        const total = servicePrices.coverPicPrice * numberOfUGCs;
        totalCustomerPrice += total;
        creatorEarnings += half(total);
        platformRevenue += half(total);
    }

    if (selectedServices.share) {
        const total = servicePrices.sharePrice * numberOfUGCs;
        totalCustomerPrice += total;
        creatorEarnings += half(total);
        platformRevenue += half(total);
    }

    if (selectedServices.duration === "30s") {
        const total = servicePrices.thirtySecondDurationPrice * numberOfUGCs;
        totalCustomerPrice += total;
        creatorEarnings += half(total);
        platformRevenue += half(total);
    }

    if (selectedServices.duration === "60s") {
        const total = servicePrices.sixtySecondDurationPrice * numberOfUGCs;
        totalCustomerPrice += total;
        creatorEarnings += half(total);
        platformRevenue += half(total);
    }

    // FULL creator service
    if (selectedServices.creatorType) {
        const total = servicePrices.creatorTypePrice * numberOfUGCs;
        totalCustomerPrice += total;
        creatorEarnings += total;
    }

    // FULL platform service
    if (selectedServices.productShipping) {
        const total = servicePrices.shippingPrice * numberOfUGCs;
        totalCustomerPrice += total;
        platformRevenue += total;
    }

    const perCreatorEarning = creatorEarnings / numberOfUGCs;

    return {
        totalCustomerPrice,
        totalCreatorEarnings: creatorEarnings,
        perCreatorEarning,
        platformRevenue,
    };
};
