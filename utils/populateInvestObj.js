export function populateInvestObj(data) {
    return {
        timestamp: new Date(),
        amountPaid: data.amountPaid,
        pricePerOz: data.goldPrice,
        goldSold: parseFloat((data.amountPaid / data.goldPrice).toFixed(4))
    };
}