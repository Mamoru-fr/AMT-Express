/**
 * CLI Script to Import Rides from CSV
 * Usage: pnpm db:import-csv <path-to-csv>
 * 
 * This script parses a CSV file and imports rides into the database
 * Columns: JOUR, HEURE, FACTURATION, BT/BC, NOM, DEPART, ARRIVEE, ID CHAUFFEUR, CHAUFFEUR, 
 *          COURSE ENVOYE, ATTENTE, TARIF CHAUFFEUR, TARIF AGENDA, TARIF CLIENT, FACT CHAUFFEUR, FORFAIT
 */

import db from './drizzle';
import { rides, rideCustomers, users, productions, projects, drivers } from './schema';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { and, eq } from 'drizzle-orm';
import { maskSensitive, safeLog, safeError, safeWarn } from '../utils/logger';
import 'dotenv/config';

interface CSVRow {
    jour: string;           // Date
    heure: string;          // Time/Hour to pick up
    facturation: string;    // Billing/Production company
    btBc: string;           // Project reference
    nom: string;            // Client name(s)
    depart: string;         // Departure location
    arrivee: string;        // Arrival location
    idChauffeur: string;    // Driver ID
    chauffeur: string;      // Driver name
    courseEnvoye: string;   // Driver dispatched to
    attente: string;        // Notes (waiting time, options, etc.)
    tarifChauffeur: string; // Driver price (with options)
    tarifAgenda: string;    // Planned price
    tarifClient: string;    // Final invoice price
    factChauffeur: string;  // Driver makes own invoice
    forfait: string;        // Flat rate price
    attentionMention: string; // Additional notes
}

interface ImportSummary {
    total: number;
    successCount: number;
    skipCount: number;
    errorCount: number;
}

/**
 * Parse a price string and convert to number
 * Handles formats like: "120.00 €", "€ 139.20", "-� 139.20", etc.
 */
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

/**
 * Parse date from French or English format like "Monday, December 1, 2025"
 */
function parseDate(dateStr: string, timeStr: string): Date | null {
    if (!dateStr || dateStr.trim() === '') {
        return null;
    }
    
    try {
        // Extract the actual date part (format: "Day, Month DD, YYYY")
        const datePart = dateStr.split(',').slice(1).join(',').trim();
        const date = new Date(datePart);
        
        // Add time if provided
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
        safeError(`Error parsing date: ${maskSensitive(dateStr)}`, e);
        return null;
    }
}

/**
 * Parse CSV content into structured rows
 */
async function parseCSV(filepath: string): Promise<CSVRow[]> {
    const content = readFileSync(filepath, 'utf-8');
    const lines = content.split('\n');
    
    const rows: CSVRow[] = [];
    
    // Parse CSV rows (skip header row 0)
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue; // Skip empty rows
        
        // Parse CSV with proper handling of quoted fields
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
        parts.push(current.trim()); // Add last field
        
        // Expected 16 columns (forfait column was removed in newer CSV format)
        if (parts.length < 16) {
            safeWarn(`Skipping row ${i + 1}: Not enough columns (${parts.length}/16)`);
            continue;
        }
        
        rows.push({
            jour: parts[0] || '',
            heure: parts[1] || '',
            facturation: parts[2] || '',
            btBc: parts[3] || '',
            nom: parts[4] || '',
            depart: parts[5] || '',
            arrivee: parts[6] || '',
            idChauffeur: parts[7] || '',
            chauffeur: parts[8] || '',
            courseEnvoye: parts[9] || '',
            attente: parts[10] || '',
            tarifChauffeur: parts[11] || '',
            tarifAgenda: parts[12] || '',
            tarifClient: parts[13] || '',
            factChauffeur: parts[14] || '',
            forfait: '',  // No longer in CSV, set to empty
            attentionMention: parts[15] || '',
        });
    }
    
    return rows;
}

/**
 * Get or create a driver by ID and name
 */
async function getOrCreateDriver(accountingCode: string, driverName: string) {
    if (!accountingCode || driverName === 'ANNULE') {
        return null;
    }

    // Rechercher par accountingCode
    const existingDriver = await db.select().from(drivers).where(eq(drivers.accountingCode, accountingCode)).limit(1);

    if (existingDriver.length > 0) {
        return existingDriver[0].userId;
    }

    // Rechercher par nom de chauffeur (au cas où l'accountingCode aurait changé mais le nom est le même)
    const existingDriverByName = await db.select()
        .from(users)
        .where(and(eq(users.name, driverName), eq(users.role, 'driver')))
        .limit(1);


    if (existingDriverByName.length > 0) {
        // Rechercher si un drivers existe déjà pour ce userId
        const existingDriverForUser = await db.select().from(drivers).where(eq(drivers.userId, existingDriverByName[0].id)).limit(1);
        if (existingDriverForUser.length > 0) {
            // Mettre à jour le driver existant avec le nouveau code comptable
            await db.update(drivers)
                .set({ accountingCode: accountingCode })
                .where(eq(drivers.id, existingDriverForUser[0].id));
            
            safeLog(`  🔄 Updated driver: ${maskSensitive(driverName)} with new accounting code ${maskSensitive(accountingCode)}`);
            return existingDriverByName[0].id;
        }

        await db.insert(drivers).values({
            userId: existingDriverByName[0].id,
            accountingCode: accountingCode,
            vehiclePlate: `PENDING-${accountingCode}`,
            vehicleType: 'unknown',
            available: true,
        });

        safeLog(`  ➕ Created driver profile for existing user: ${maskSensitive(driverName)} (${maskSensitive(accountingCode)})`);
        return existingDriverByName[0].id;
    }

    // Créer un nouveau chauffeur avec un GUID partagé entre users et drivers
    const userId = randomUUID();
    const email = `${accountingCode.toLowerCase()}@amt-express.com`;

    await db.transaction(async (tx) => {
        await tx.insert(users).values({
            id: userId,
            name: driverName,
            email: email,
            role: 'driver',
            emailVerified: false,
        });
        
        await tx.insert(drivers).values({
            userId: userId,
            accountingCode: accountingCode,
            vehiclePlate: `PENDING-${accountingCode}`,
            vehicleType: 'unknown',
            available: true,
        });
    });

    safeLog(`  ➕ Created driver: ${maskSensitive(driverName)} (${maskSensitive(accountingCode)})`);
    return userId;
}

/**
 * Get or create a production company
 */
async function getOrCreateProduction(productionName: string) {
    if (!productionName || productionName.trim() === '' || productionName.toUpperCase() === 'PAYE') {
        return null;
    }

    const productionId = productionName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const existingProduction = await db.select().from(productions).where(eq(productions.id, productionId)).limit(1);

    if (existingProduction.length > 0) {
        return existingProduction[0].id;
    }

    // Créer un projet générique pour la production
    const genericProjectId = `${productionId}-general`;
    await db.insert(projects).values({
        id: genericProjectId,
        name: `${productionName} - General`,
        productionId: productionId,
        isGeneric: true,
        startDate: new Date(),
        endDate: new Date(),
    });

    // Créer la production
    const email = `${productionId}@production.com`;
    await db.insert(productions).values({
        id: productionId,
        name: productionName,
        contactEmail: email,
    });

    safeLog(`  ➕ Created production: ${maskSensitive(productionName)} with generic project`);
    return productionId;
}

async function getOrCreateProject(projectName: string, productionId: string) {
    if (!projectName || projectName.trim() === '' || projectName.toUpperCase() === 'PAYE') {
        return null;
    }

    const projectId = projectName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const existingProject = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);

    if (existingProject.length > 0) {
        return existingProject[0].id;
    }

    await db.insert(projects).values({
        id: projectId,
        name: projectName,
        productionId: productionId,
        isGeneric: false,
        startDate: new Date(),
        endDate: new Date(),
    });

    safeLog(`  ➕ Created project: ${maskSensitive(projectName)}`);
    return projectId;
}

async function getOrCreateCustomer(customerName: string) {
    if (!customerName || customerName.trim() === '') {
        return null;
    }

    // Extraire le nom principal (ex: "ROBIC - 4P" → "ROBIC")
    const mainName = customerName.split(' - ')[0].trim();

    // Rechercher le client
    const existingCustomer = await db.select().from(users).where(eq(users.name, mainName)).limit(1);

    if (existingCustomer.length > 0) {
        return existingCustomer[0].id;
    }

    // Créer un nouveau client
    const customerId = randomUUID();
    const email = `${mainName.toLowerCase()}@customer.com`;

    await db.insert(users).values({
        id: customerId,
        name: mainName,
        email: email,
        role: 'customer',
        emailVerified: false,
    });

    safeLog(`  ➕ Created customer: ${maskSensitive(mainName)}`);
    return customerId;
}

async function importCSV(csvPath: string): Promise<ImportSummary> {
    console.log('\n📂 CSV Ride Import Script\n');
    console.log(`📄 Reading file: ${csvPath}\n`);
    
    // =============================================
    // WARNING: This import is NOT atomic!
    // If an error occurs mid-import, some data may have been inserted
    // =============================================
    console.log('⚠️  IMPORTANT: This import operation is NOT transactional.');
    console.log('⚠️  If an error occurs, some data may be partially imported.');
    console.log('⚠️  Always test with a backup before running on production data.\n');
    
    try {
        // Parse CSV
        console.log('📋 Parsing CSV file...');
        const rows = await parseCSV(csvPath);
        console.log(`✅ Found ${rows.length} ride(s) to import\n`);
        
        if (rows.length === 0) {
            console.log('ℹ️  No valid rides found in CSV');
            return {
                total: 0,
                successCount: 0,
                skipCount: 0,
                errorCount: 0,
            };
        }
        
        // Fetch existing rides from database to avoid duplicates
        console.log('🔍 Checking existing rides in database...');
        const existingRides = await db.select().from(rides);
        console.log(`✅ Found ${existingRides.length} existing ride(s) in database\n`);
        
        // Create a Set of existing ride hashes for fast lookup
        const existingRideHashes = new Set<string>();
        existingRides.forEach(ride => {
            const rideHash = JSON.stringify({
                date: new Date(ride.departureTime).toISOString(),
                depart: ride.departure,
                arrivee: ride.destination,
                driver: ride.driverId,
                price: parseFloat(ride.price),
            });
            existingRideHashes.add(rideHash);
        });
        
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        
        // Track skipped rides with reasons
        const skippedRides: Array<{row: number; name: string; reason: string}> = [];
        
        // Track imported rides to detect duplicates (hash of all fields)
        const importedRides = new Set<string>();
        
        // Process each row
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            safeLog(`\n[${i + 1}/${rows.length}] Processing ride: ${maskSensitive(row.nom || 'Unnamed')}`);
            
            try {
                // // Skip cancelled rides
                // if (row.chauffeur === 'ANNULE' || row.nom === 'ANNULE') {
                //     const reason = 'Cancelled ride';
                //     console.log(`  ⏭️  Skipped: ${reason}`);
                //     skippedRides.push({row: i + 1, name: row.nom || 'Unnamed', reason});
                //     skipCount++;
                //     continue;
                // }
                
                // Skip rows without required data
                if (!row.depart || !row.arrivee || !row.jour) {
                    const reason = 'Missing required fields (departure, arrival, or date)';
                    console.log(`  ⏭️  Skipped: ${reason}`);
                    skippedRides.push({row: i + 1, name: row.nom || 'Unnamed', reason});
                    skipCount++;
                    continue;
                }
                
                // Parse date and time
                const departureTime = parseDate(row.jour, row.heure);
                if (!departureTime) {
                    const reason = 'Invalid date format';
                    console.log(`  ⏭️  Skipped: ${reason}`);
                    skippedRides.push({row: i + 1, name: row.nom || 'Unnamed', reason});
                    skipCount++;
                    continue;
                }
                
                // Parse prices
                const driverPrice = parsePrice(row.tarifChauffeur);
                const plannedPrice = parsePrice(row.tarifAgenda);
                const clientPrice = parsePrice(row.tarifClient);
                const finalPrice = driverPrice > 0 ? driverPrice : (plannedPrice > 0 ? plannedPrice : clientPrice);
                
                if (finalPrice === 0) {
                    const reason = 'No valid price found';
                    console.log(`  ⚠️  Warning: ${reason}`);
                    // console.log(`  ⏭️  Skipped: ${reason}`);
                    // skippedRides.push({row: i + 1, name: row.nom || 'Unnamed', reason});
                    // skipCount++;
                    continue;
                }
                
                // Check for duplicates - create hash of all ride data
                const rideHash = JSON.stringify({
                    date: departureTime.toISOString(),
                    depart: row.depart,
                    arrivee: row.arrivee,
                    driver: row.idChauffeur,
                    price: finalPrice,
                });
                
                // Check against existing database rides
                if (existingRideHashes.has(rideHash)) {
                    const reason = 'Already exists in database (identical ride found)';
                    console.log(`  ⏭️  Skipped: ${reason}`);
                    skippedRides.push({row: i + 1, name: row.nom || 'Unnamed', reason});
                    skipCount++;
                    continue;
                }
                
                // Check against rides imported in this session
                if (importedRides.has(rideHash)) {
                    const reason = 'Duplicate in CSV (identical ride appears multiple times)';
                    console.log(`  ⏭️  Skipped: ${reason}`);
                    skippedRides.push({row: i + 1, name: row.nom || 'Unnamed', reason});
                    skipCount++;
                    continue;
                }
                
                // Get or create driver
                const driverId = await getOrCreateDriver(row.idChauffeur, row.chauffeur);
                
                // Get driver record to get drivers.id
                let driverIdString: string | null = null;
                if (driverId) {
                    const driverRecord = await db.query.drivers.findFirst({
                        where: (drivers, {eq}) => eq(drivers.userId, driverId)
                    });
                    driverIdString = driverRecord?.id ?? null;
                }
                
                let productionId: string | null = null;
                let projectId: string | null = null;

                // Get or create production and project
                if (row.facturation && row.facturation.toUpperCase() !== 'PAYE') {
                    productionId = await getOrCreateProduction(row.facturation);

                    if (productionId) {
                        if (row.btBc && row.btBc.toUpperCase() !== 'PAYE') {
                            projectId = await getOrCreateProject(row.btBc, productionId);
                        } else {
                            const genericProject = await db.select().from(projects).where(eq(projects.productionId, productionId)).limit(1);
                            projectId = genericProject[0]?.id ?? null;
                        }
                    }
                }

                // Get or create customers
                const customerNames = row.nom
                    ? row.nom.split('/').map(name => name.trim()).filter(Boolean)
                    : [];
                const customerIds: string[] = [];

                for (const customerName of customerNames) {
                    const customerId = await getOrCreateCustomer(customerName);
                    if (customerId) {
                        customerIds.push(customerId);
                    }
                }
                
                // Build customer notes
                const notes: string[] = [];
                if (row.attente) notes.push(`Wait/Options: ${row.attente}`);
                if (row.courseEnvoye && row.courseEnvoye !== row.chauffeur) {
                    notes.push(`Dispatched to: ${row.courseEnvoye}`);
                }
                if (row.forfait) notes.push(`Flat rate: ${row.forfait}`);
                if (row.attentionMention) notes.push(`Note: ${row.attentionMention}`);
                if (driverPrice > 0) notes.push(`Driver price: €${driverPrice.toFixed(2)}`);
                if (plannedPrice > 0) notes.push(`Planned price: €${plannedPrice.toFixed(2)}`);
                
                // Insert ride
                const [ride] = await db.insert(rides).values({
                    departure: row.depart,
                    destination: row.arrivee,
                    departureTime: departureTime,
                    price: finalPrice.toString(),
                    status: 'completed',
                    driverId: driverIdString,
                    projectId: projectId ?? undefined,
                    customerNotes: notes.join(' | ') || null,
                }).returning();

                // Associate customers to the ride
                if (customerIds.length > 0) {
                    await db.insert(rideCustomers).values(
                        customerIds.map(customerId => ({
                            rideId: ride.id,
                            customerId,
                        }))
                    );
                }
                
                // Mark this ride as imported (add to duplicate check set)
                importedRides.add(rideHash);
                
                safeLog(`  ✅ Imported: ${maskSensitive(row.depart)} → ${maskSensitive(row.arrivee)} (€${finalPrice.toFixed(2)})`);
                successCount++;
                
            } catch (error) {
                safeError(`  ❌ Error:`, error);
                skippedRides.push({row: i + 1, name: row.nom || 'Unnamed', reason: `Error: ${error}`});
                errorCount++;
            }
        }
        
        // Summary
        console.log('\n' + '='.repeat(50));
        console.log('📊 Import Summary:');
        console.log(`   ✅ Successfully imported: ${successCount}`);
        console.log(`   ⏭️  Skipped: ${skipCount}`);
        console.log(`   ❌ Errors: ${errorCount}`);
        console.log(`   📝 Total processed: ${rows.length}`);
        console.log('='.repeat(50));
        
        // Detailed skipped rides report
        if (skippedRides.length > 0) {
            console.log('\n' + '='.repeat(50));
            console.log('📋 Skipped Rides Details:');
            console.log('='.repeat(50));
            
            // Group by reason
            const groupedByReason = skippedRides.reduce((acc, ride) => {
                if (!acc[ride.reason]) {
                    acc[ride.reason] = [];
                }
                acc[ride.reason].push(ride);
                return acc;
            }, {} as Record<string, typeof skippedRides>);
            
            // Display grouped results
            Object.entries(groupedByReason).forEach(([reason, rides]) => {
                console.log(`\n⚠️  ${reason} (${rides.length} rides):`);
                rides.slice(0, 10).forEach(ride => {
                    console.log(`   • Row ${ride.row}: ${ride.name}`);
                });
                if (rides.length > 10) {
                    console.log(`   ... and ${rides.length - 10} more`);
                }
            });
            
            console.log('\n' + '='.repeat(50));
        }
        
        console.log('\n');
        return {
            total: rows.length,
            successCount,
            skipCount,
            errorCount,
        };
        
    } catch (error) {
        safeError('❌ Fatal error during import:', error);
        // Provide guidance on how to recover
        if (error instanceof Error) {
            safeError('\n💡 Recovery suggestions:');
            safeError('   1. Check your CSV file for invalid data');
            safeError('   2. Verify your database connection');
            safeError('   3. Some data may have been partially imported.');
            safeError('   4. Run a backup check: pnpm db:backup');
            safeError('   5. Review the error above for specific details');
        }
        throw error;
    }
}

// Main execution
const csvPath = process.argv[2];

if (!csvPath) {
    console.error('❌ Error: Please provide a CSV file path');
    console.log('\nUsage:');
    console.log('  ts-node lib/db/import-csv.ts <path-to-csv-file>');
    console.log('\nExample:');
    console.log('  ts-node lib/db/import-csv.ts ~/Downloads/AGENDA-2025-DECEMBRE.csv');
    process.exit(1);
}

importCSV(csvPath)
    .then((summary) => {
        console.log('\n📌 Bilan de l\'import:');
        console.log(`   • Total lignes lues: ${summary.total}`);
        console.log(`   • Courses importées: ${summary.successCount}`);
        console.log(`   • Lignes ignorées: ${summary.skipCount}`);
        console.log(`   • Erreurs: ${summary.errorCount}`);
        console.log('✅ Import completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Import failed:', error);
        process.exit(1);
    });
