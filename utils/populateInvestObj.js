

export function populateInvestObj(amountPaid) {
    // Get timestamp
    
    const goldPrice = getGoldPrice();

    return {
        timestamp: new Date(),
        amountPaid: amountPaid,
        pricePerOz: goldPrice,
        goldSold: amountPaid / goldPrice
    };
}