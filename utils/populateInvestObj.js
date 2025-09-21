import { v4 as uuidv4 } from 'uuid';

export function populateInvestObj(data) {
    return {
        uuid: uuidv4(),
        timestamp: new Date(),
        amountPaid: data.amountPaid,
        pricePerOz: data.goldPrice,
        goldSold: parseFloat((data.amountPaid / data.goldPrice).toFixed(4))
    };
}