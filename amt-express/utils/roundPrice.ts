import { z } from 'zod';

const PriceInputSchema = z
    .union([
        z.number().finite().nonnegative(),
        z.string().regex(/^\d+(\.\d+)?$/, 'Must be a positive numeric value'),
    ])
    .transform(v => (typeof v === 'string' ? parseFloat(v) : v));

/**
 * Rounds a price to the nearest integer, returned as a string with 2 decimal places.
 * Accepts a number or numeric string. Throws on invalid input.
 * @example roundPrice(32.4)    // => "32.00"
 * @example roundPrice("49.30") // => "49.00"
 * @example roundPrice(33.6)    // => "34.00"
 */
export function roundPrice(value: number | string): string {
    const parsed = PriceInputSchema.safeParse(value);
    if (!parsed.success) throw new Error(`Invalid price value: ${parsed.error.issues[0]?.message}`);
    return Math.round(parsed.data).toFixed(2);
}
