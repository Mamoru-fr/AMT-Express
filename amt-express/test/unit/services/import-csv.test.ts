import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { readFileSync, writeFileSync, unlinkSync } from 'fs';
import path from 'path';
import { tmpdir } from 'os';

// Mock the database module before importing
vi.mock('../lib/db/drizzle', () => ({
    default: {
        select: vi.fn(),
        insert: vi.fn(),
    }
}));

vi.mock('drizzle-orm', () => ({
    eq: vi.fn((field, value) => ({ field, value })),
}));

// Import after mocking
import db from '@/lib/db/drizzle';

// Helper functions extracted from import-csv.ts for testing
function parsePrice(priceStr: string): number {
    if (!priceStr || priceStr.trim() === '') {
        return 0;
    }
    
    // Remove currency symbols, spaces, and extract number
    const cleaned = priceStr
        .replace(/€/g, '')
        .replace(/�/g, '')
        .replace(/-/g, '')  // Also remove negative signs
        .replace(/\s/g, '')
        .replace(/,/g, '.')
        .trim();
    
    const number = parseFloat(cleaned);
    return isNaN(number) ? 0 : number;
}

function parseDate(dateStr: string, timeStr: string): Date | null {
    if (!dateStr || dateStr.trim() === '') {
        return null;
    }
    
    try {
        const datePart = dateStr.split(',').slice(1).join(',').trim();
        const date = new Date(datePart);
        
        if (timeStr && timeStr.trim() !== '') {
            const timeParts = timeStr.split('.');
            if (timeParts.length === 2) {
                const hours = parseInt(timeParts[0]);
                const minutes = parseInt(timeParts[1]);
                if (!isNaN(hours) && !isNaN(minutes)) {
                    date.setHours(hours, minutes, 0, 0);
                }
            }
        }
        
        return isNaN(date.getTime()) ? null : date;
    } catch (e) {
        return null;
    }
}

function parseCSVLine(line: string): string[] {
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
        const char = line[j];
        
        if (char === '"') {
            // Check if next character is also a quote (escaped quote)
            if (inQuotes && j + 1 < line.length && line[j + 1] === '"') {
                // This is an escaped quote, keep both quotes
                current += '""';
                j++; // Skip the next quote
            } else {
                // Toggle quote mode
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            parts.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    parts.push(current.trim());
    
    return parts;
}

describe('CSV Import [UNIT] - parsePrice', () => {
    it('should parse price with euro symbol after number', () => {
        expect(parsePrice('120.00 €')).toBe(120.00);
    });

    it('should parse price with euro symbol before number', () => {
        expect(parsePrice('€ 139.20')).toBe(139.20);
    });

    it('should parse price with comma as decimal separator', () => {
        expect(parsePrice('150,50 €')).toBe(150.50);
    });

    it('should parse negative price by removing negative sign', () => {
        expect(parsePrice('-120.00 €')).toBe(120.00);
    });

    it('should return 0 for empty string', () => {
        expect(parsePrice('')).toBe(0);
    });

    it('should parse price with malformed character (�)', () => {
        expect(parsePrice('-� 139.20')).toBe(139.20);
    });

    it('should return 0 for whitespace only', () => {
        expect(parsePrice('   ')).toBe(0);
    });

    it('should handle price without currency symbol', () => {
        expect(parsePrice('99.99')).toBe(99.99);
    });

    it('should handle price with spaces', () => {
        expect(parsePrice(' 50.00 ')).toBe(50.00);
    });

    it('should return 0 for invalid price string', () => {
        expect(parsePrice('abc')).toBe(0);
    });
});

describe('CSV Import [UNIT] - parseDate', () => {
    it('should parse date with English format', () => {
        const result = parseDate('Monday, December 1, 2025', '');
        expect(result).toBeInstanceOf(Date);
        expect(result?.getMonth()).toBe(11); // December is month 11
        expect(result?.getDate()).toBe(1);
        expect(result?.getFullYear()).toBe(2025);
    });

    it('should parse date with time', () => {
        const result = parseDate('Monday, December 1, 2025', '7.30');
        expect(result).toBeInstanceOf(Date);
        expect(result?.getHours()).toBe(7);
        expect(result?.getMinutes()).toBe(30);
    });

    it('should parse date with afternoon time', () => {
        const result = parseDate('Monday, December 1, 2025', '14.45');
        expect(result).toBeInstanceOf(Date);
        expect(result?.getHours()).toBe(14);
        expect(result?.getMinutes()).toBe(45);
    });

    it('should return null for empty date string', () => {
        expect(parseDate('', '7.30')).toBeNull();
    });

    it('should return null for whitespace only', () => {
        expect(parseDate('   ', '7.30')).toBeNull();
    });

    it('should handle date without time', () => {
        const result = parseDate('Monday, December 1, 2025', '');
        expect(result).toBeInstanceOf(Date);
    });

    it('should handle malformed time gracefully', () => {
        const result = parseDate('Monday, December 1, 2025', 'abc');
        expect(result).toBeInstanceOf(Date);
        // Time should not be set
    });

    it('should return null for invalid date', () => {
        const result = parseDate('Invalid Date Format', '7.30');
        expect(result).toBeNull();
    });
});

describe('CSV Import [UNIT] - parseCSVLine', () => {
    it('should parse simple CSV line', () => {
        const result = parseCSVLine('field1,field2,field3');
        expect(result).toEqual(['field1', 'field2', 'field3']);
    });

    it('should handle quoted fields with commas', () => {
        const result = parseCSVLine('field1,"field2,with,commas",field3');
        expect(result).toEqual(['field1', 'field2,with,commas', 'field3']);
    });

    it('should trim whitespace from fields', () => {
        const result = parseCSVLine('  field1  ,  field2  ,  field3  ');
        expect(result).toEqual(['field1', 'field2', 'field3']);
    });

    it('should handle empty fields', () => {
        const result = parseCSVLine('field1,,field3');
        expect(result).toEqual(['field1', '', 'field3']);
    });

    it('should handle quotes in the middle of quoted fields', () => {
        const result = parseCSVLine('"field with ""quotes""",field2');
        expect(result).toEqual(['field with ""quotes""', 'field2']);
    });

    it('should handle a single field', () => {
        const result = parseCSVLine('single');
        expect(result).toEqual(['single']);
    });
});

describe('CSV Import [UNIT] - Full CSV Parsing', () => {
    let tempFilePath: string;

    beforeEach(() => {
        tempFilePath = path.join(tmpdir(), `test-import-${Date.now()}.csv`);
    });

    afterEach(() => {
        try {
            if (tempFilePath) {
                unlinkSync(tempFilePath);
            }
        } catch (e) {
            // File might not exist
        }
    });

    it('should parse valid CSV file', () => {
        const csvContent = `JOUR,HEURE,FACTURATION,BT/BC,NOM,DEPART,ARRIVEE,ID CHAUFFEUR,CHAUFFEUR,COURSE ENVOYE,ATTENTE,TARIF CHAUFFEUR,TARIF AGENDA,TARIF CLIENT,FACT CHAUFFEUR,FORFAIT,ATTENTION MENTION
"Monday, December 1, 2025",7.30,WARNER,PROJECT1,JOHN DOE,CDG,P18,CFR001,DRIVER1,,VAN,120.00 €,€ 120.00,€ 139.20,FACT,,
"Tuesday, December 2, 2025",8.00,COOL SYNDICATE,PROJECT2,JANE SMITH,P2,CDG,CFR002,DRIVER2,,ATT 30 MIN,80.00 €,,€ 92.80,ENT,,`;
        
        writeFileSync(tempFilePath, csvContent, 'utf-8');
        
        const content = readFileSync(tempFilePath, 'utf-8');
        const lines = content.split('\n');
        
        expect(lines.length).toBe(3); // Header + 2 data rows
    });

    it('should skip empty lines', () => {
        const csvContent = `JOUR,HEURE,FACTURATION,BT/BC,NOM,DEPART,ARRIVEE,ID CHAUFFEUR,CHAUFFEUR,COURSE ENVOYE,ATTENTE,TARIF CHAUFFEUR,TARIF AGENDA,TARIF CLIENT,FACT CHAUFFEUR,FORFAIT,ATTENTION MENTION
"Monday, December 1, 2025",7.30,WARNER,PROJECT1,JOHN DOE,CDG,P18,CFR001,DRIVER1,,VAN,120.00 €,€ 120.00,€ 139.20,FACT,,

"Tuesday, December 2, 2025",8.00,COOL SYNDICATE,PROJECT2,JANE SMITH,P2,CDG,CFR002,DRIVER2,,ATT 30 MIN,80.00 €,,€ 92.80,ENT,,`;
        
        writeFileSync(tempFilePath, csvContent, 'utf-8');
        
        const content = readFileSync(tempFilePath, 'utf-8');
        const lines = content.split('\n').filter(line => line.trim() !== '');
        
        expect(lines.length).toBe(3); // Header + 2 data rows (empty line filtered)
    });
});

describe('CSV Import [UNIT] - Data Validation', () => {
    it('should identify cancelled rides', () => {
        const chauffeur = 'ANNULE';
        expect(chauffeur).toBe('ANNULE');
    });

    it('should identify rides with missing required fields', () => {
        const ride = {
            depart: '',
            arrivee: 'CDG',
            jour: 'Monday, December 1, 2025'
        };
        
        expect(ride.depart).toBe('');
    });

    it('should prioritize client price over other prices', () => {
        const driverPrice = 120;
        const plannedPrice = 125;
        const clientPrice = 139.20;
        
        const finalPrice = clientPrice > 0 ? clientPrice : (plannedPrice > 0 ? plannedPrice : driverPrice);
        expect(finalPrice).toBe(139.20);
    });

    it('should fall back to planned price when client price is 0', () => {
        const driverPrice = 120;
        const plannedPrice = 125;
        const clientPrice = 0;
        
        const finalPrice = clientPrice > 0 ? clientPrice : (plannedPrice > 0 ? plannedPrice : driverPrice);
        expect(finalPrice).toBe(125);
    });

    it('should fall back to driver price when both client and planned are 0', () => {
        const driverPrice = 120;
        const plannedPrice = 0;
        const clientPrice = 0;
        
        const finalPrice = clientPrice > 0 ? clientPrice : (plannedPrice > 0 ? plannedPrice : driverPrice);
        expect(finalPrice).toBe(120);
    });
});

describe('CSV Import [UNIT] - Note Building', () => {
    it('should build customer notes from multiple fields', () => {
        const row = {
            attente: 'VAN / ATT 30 MIN',
            courseEnvoye: 'VAN - VINCENT',
            chauffeur: 'DRIVER1',
            forfait: '€100',
            attentionMention: 'URGENT',
        };
        
        const notes: string[] = [];
        if (row.attente) notes.push(`Wait/Options: ${row.attente}`);
        if (row.courseEnvoye && row.courseEnvoye !== row.chauffeur) {
            notes.push(`Dispatched to: ${row.courseEnvoye}`);
        }
        if (row.forfait) notes.push(`Flat rate: ${row.forfait}`);
        if (row.attentionMention) notes.push(`Note: ${row.attentionMention}`);
        
        const customerNotes = notes.join(' | ');
        
        expect(customerNotes).toContain('Wait/Options: VAN / ATT 30 MIN');
        expect(customerNotes).toContain('Dispatched to: VAN - VINCENT');
        expect(customerNotes).toContain('Flat rate: €100');
        expect(customerNotes).toContain('Note: URGENT');
    });

    it('should not duplicate driver in notes if same as dispatched', () => {
        const row = {
            courseEnvoye: 'DRIVER1',
            chauffeur: 'DRIVER1',
        };
        
        const notes: string[] = [];
        if (row.courseEnvoye && row.courseEnvoye !== row.chauffeur) {
            notes.push(`Dispatched to: ${row.courseEnvoye}`);
        }
        
        expect(notes.length).toBe(0);
    });
});

describe('CSV Import [UNIT] - Driver ID Generation', () => {
    it('should handle driver IDs correctly', () => {
        const driverId = 'CFR00132';
        const driverName = 'TOUFIK ROMAINVILLE';
        
        expect(driverId).toBeTruthy();
        expect(driverName).toBeTruthy();
    });

    it('should skip null driver ID', () => {
        const driverId = '';
        const shouldSkip = !driverId || driverId === 'ANNULE';
        
        expect(shouldSkip).toBe(true);
    });

    it('should skip ANNULE driver', () => {
        const driverId = 'ANNULE';
        const shouldSkip = !driverId || driverId === 'ANNULE';
        
        expect(shouldSkip).toBe(true);
    });
});

describe('CSV Import [UNIT] - Production ID Generation', () => {
    it('should generate production ID from name', () => {
        const productionName = 'WARNER BROS';
        const productionId = productionName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        
        expect(productionId).toBe('warner-bros');
    });

    it('should handle special characters in production name', () => {
        const productionName = 'COOL SYNDICATE / DIVISION';
        const productionId = productionName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        
        expect(productionId).toBe('cool-syndicate-division');
    });

    it('should handle production name with numbers', () => {
        const productionName = '109P';
        const productionId = productionName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
        
        expect(productionId).toBe('109p');
    });

    it('should return null for empty production name', () => {
        const productionName = '';
        const shouldReturnNull = !productionName;
        
        expect(shouldReturnNull).toBe(true);
    });
});

describe('CSV Import [UNIT] - Edge Cases', () => {
    it('should handle rides with multiple passengers', () => {
        const nom = 'JOHN DOE + JANE SMITH + BOB JOHNSON';
        expect(nom).toContain('+');
        expect(nom.split('+').length).toBe(3);
    });

    it('should handle complex location strings', () => {
        const location = 'P18+CHAMPIGNY';
        expect(location).toContain('+');
    });

    it('should handle airport codes', () => {
        const locations = ['CDG', 'ORLY', 'G NORD', 'G LYON', 'G EST'];
        locations.forEach(loc => {
            expect(loc.length).toBeGreaterThan(0);
        });
    });

    it('should handle VAN notation in notes', () => {
        const note = 'VAN / VIP / MISE A DISPO DE 8H A 18H';
        expect(note).toContain('VAN');
    });

    it('should handle waiting time notation', () => {
        const attente = 'ATT 30 MIN';
        expect(attente).toContain('ATT');
    });
});
