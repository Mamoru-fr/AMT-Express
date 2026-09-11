import { roundPrice } from "@/utils/roundPrice";

export function calculateClientPrice(driverPrice: string): string {
    const priceNumber = parseFloat(driverPrice);
    if (isNaN(priceNumber)) {
        throw new Error(`Invalid driver price: ${driverPrice}`);
    }
    const clientPrice = priceNumber * 1.16; // Adding 16% markup
    return roundPrice(clientPrice);
}