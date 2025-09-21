// AUD / 1 oz (21 September 2025)
let goldPrice = 5612.33

export function getGoldPrice(min = 5000, max = 6000) {
    // Each update change has size 0 - 0.999
    let change = Math.random();

    // Do we increase or decrease price?
    change = Math.random() < 0.5 ? -change : change;
    goldPrice += change;

    // Clamp the value within min and max
    goldPrice = parseFloat(Math.max(min, Math.min(max, goldPrice)).toFixed(2));

    return goldPrice;
}