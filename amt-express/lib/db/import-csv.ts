/**
 * CLI Script to Import Rides from CSV
 * Usage: pnpm db:import-csv <path-to-csv>
 * 
 * This script parses a CSV file and imports rides into the database
 * Columns: JOUR, HEURE, FACTURATION, BT/BC, NOM, DEPART, ARRIVEE, ID CHAUFFEUR, CHAUFFEUR, 
 *          COURSE ENVOYE, ATTENTE, TARIF CHAUFFEUR, TARIF AGENDA, TARIF CLIENT, FACT CHAUFFEUR, FORFAIT
 */

import db from './drizzle';
import { rides, rideCustomers, rideManagers, users, productions, projects, drivers } from './schema';
import { readFileSync } from 'fs';
import { randomUUID } from 'crypto';
import { and, eq, or } from 'drizzle-orm';
import { maskSensitive, safeLog, safeError, safeWarn } from '../utils/logger';
import { auth } from '../auth/auth';
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
 * Handles formats like: "120.00 €", "€ 139.20", "-� 139.20", " -   € ", etc.
 */
function parsePrice(priceStr: string): number {
    if (!priceStr || priceStr.trim() === '') {
        return 0;
    }
    
    // Nettoyer la chaîne : supprimer tous les caractères non numériques sauf . et ,
    const cleaned = priceStr
        .replace(/[^0-9.,-]/g, '')  // Garde seulement chiffres, . , et -
        .replace(/,/g, '.')      // Remplace les virgules par des points
        .trim();
    
    // Si la chaîne est vide ou invalide, retourner 0
    if (cleaned === '' || cleaned === '-' || cleaned === '.') {
        return 0;
    }
    
    const number = parseFloat(cleaned);
    return isNaN(number) ? 0 : Math.abs(number); // Math.abs pour éviter les négatifs
}

/**
 * Calcule le prix facturé : tarifChauffeur * 1.16 + arrondi
 * - Si décimale >= 0.5 → arrondi supérieur
 * - Sinon → arrondi inférieur
 */
function calculateBilledPrice(driverPrice: number): number {
    if (driverPrice === 0) return 0;
    const priceWithTax = driverPrice * 1.16;
    return Math.floor(priceWithTax + 0.5); // Arrondi standard
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
 * Crée ou récupère un utilisateur via Better-Auth
 * - Vérifie d'abord si l'utilisateur existe déjà (par email ou nom)
 * - Si non, crée un nouvel utilisateur avec un mot de passe temporaire
 * - Rôle par défaut : 'customer' (peut être écrasé)
 */
async function getOrCreateUserWithAuth(
    name: string,
    email: string,
    role: 'driver' | 'customer' = 'customer'
): Promise<string | null> {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    
    // 1. Vérifier si un utilisateur existe déjà avec cet email
    const existingUserByEmail = await db.select()
        .from(users)
        .where(eq(users.email, cleanEmail))
        .limit(1);
    
    if (existingUserByEmail.length > 0) {
        // Mettre à jour le rôle si nécessaire
        if (existingUserByEmail[0].role !== role) {
            await db.update(users)
                .set({ role: role })
                .where(eq(users.id, existingUserByEmail[0].id));
            safeLog(`  🔄 Updated user role: ${maskSensitive(cleanName)} (${maskSensitive(cleanEmail)}) -> ${role}`);
        }
        return existingUserByEmail[0].id;
    }
    
    // 2. Vérifier si un utilisateur existe déjà avec ce nom (même email différent)
    const existingUserByName = await db.select()
        .from(users)
        .where(eq(users.name, cleanName))
        .limit(1);
    
    if (existingUserByName.length > 0) {
        // Mettre à jour l'email et le rôle si nécessaire
        if (existingUserByName[0].email !== cleanEmail) {
            await db.update(users)
                .set({ email: cleanEmail })
                .where(eq(users.id, existingUserByName[0].id));
        }
        if (existingUserByName[0].role !== role) {
            await db.update(users)
                .set({ role: role })
                .where(eq(users.id, existingUserByName[0].id));
            safeLog(`  🔄 Updated user: ${maskSensitive(cleanName)} with new email/role`);
        }
        return existingUserByName[0].id;
    }
    
    // 3. Créer un nouvel utilisateur via Better-Auth
    try {
        // Générer un mot de passe temporaire complexe (8+ chars, maj, min, chiffre, symbole)
        const tempPassword = randomUUID().substring(0, 8) + 'Ab1!';
        
        // Utiliser l'API Better-Auth pour créer l'utilisateur
        const response = await auth.api.signUpEmail({
            body: {
                name: cleanName,
                email: cleanEmail,
                password: tempPassword,
            },
            asResponse: true,
        });

        if (!response.ok) {
            const errorData = await response.json();
            safeError(`Failed to create user ${maskSensitive(cleanName)}: ${errorData.error}`);
            return null;
        }

        // Récupérer l'ID de l'utilisateur créé
        const userData = await response.json();
        const userId = userData.user?.id;

        if (!userId) {
            safeError(`No user ID returned for ${maskSensitive(cleanName)}`);
            return null;
        }

        // Mettre à jour le rôle si nécessaire (Better-Auth gère les rôles via l'adapter)
        if (role !== 'customer') { // 'customer' est le rôle par défaut dans auth.ts
            await db.update(users)
                .set({ role: role })
                .where(eq(users.id, userId));
        }

        safeLog(`  ➕ Created ${role} user via Better-Auth: ${maskSensitive(cleanName)} (${maskSensitive(cleanEmail)})`);
        return userId;
    } catch (error) {
        safeError(`Error creating user ${maskSensitive(cleanName)}:`, error);
        return null;
    }
}

/**
 * Formate les codes d'arrondissement de Paris (PXX → Paris XX)
 */
function formatParisDistrict(location: string): string {
    if (!location) return location;
    
    // Regex pour matcher P suivi de 1 ou 2 chiffres (P0-P99)
    const parisDistrictRegex = /\bP(\d{1,2})\b/gi;
    
    return location.replace(parisDistrictRegex, (match, districtNumber) => {
        return `Paris ${districtNumber}`;
    });
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
        
        // Debug: Log parsed parts for KHOJANDI line
        if (parts.some(p => p.includes('KHOJANDI') || p.includes('GUERARD'))) {
            console.log(`\n🔍 DEBUG Row ${i + 1} (KHOJANDI):`);
            console.log(`   Parsed parts (${parts.length} columns):`);
            parts.forEach((part, idx) => {
                console.log(`     [${idx}]: "${part}"`);
            });
        }
        
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
 * - Vérifie d'abord si le driver existe déjà (par accountingCode)
 * - Sinon, vérifie si un user avec ce nom existe déjà (et crée le profil driver)
 * - Sinon, crée un nouvel utilisateur + profil driver
 */
async function getOrCreateDriver(accountingCode: string, driverName: string): Promise<string | null> {
    if (!accountingCode || driverName === 'ANNULE') {
        return null;
    }

    const cleanDriverName = driverName.trim();

    // 1. Rechercher par accountingCode (le plus fiable)
    const existingDriver = await db.select().from(drivers).where(eq(drivers.accountingCode, accountingCode)).limit(1);

    if (existingDriver.length > 0) {
        return existingDriver[0].userId;
    }

    // 2. Rechercher par nom de chauffeur (au cas où l'accountingCode aurait changé)
    const existingDriverByName = await db.select()
        .from(users)
        .where(and(eq(users.name, cleanDriverName), eq(users.role, 'driver')))
        .limit(1);

    if (existingDriverByName.length > 0) {
        // Rechercher si un profil driver existe déjà pour ce userId
        const existingDriverForUser = await db.select().from(drivers).where(eq(drivers.userId, existingDriverByName[0].id)).limit(1);
        
        if (existingDriverForUser.length > 0) {
            // Mettre à jour le accountingCode si nécessaire
            if (existingDriverForUser[0].accountingCode !== accountingCode) {
                await db.update(drivers)
                    .set({ accountingCode: accountingCode })
                    .where(eq(drivers.id, existingDriverForUser[0].id));
                safeLog(`  🔄 Updated driver accounting code: ${maskSensitive(cleanDriverName)} -> ${maskSensitive(accountingCode)}`);
            }
            return existingDriverByName[0].id;
        }

        // Créer le profil driver pour cet utilisateur existant
        const driverId = randomUUID();
        await db.insert(drivers).values({
            id: driverId,
            userId: existingDriverByName[0].id,
            accountingCode: accountingCode,
            vehiclePlate: `PENDING-${accountingCode}`,
            vehicleType: 'unknown',
            available: true,
        });

        safeLog(`  ➕ Created driver profile for existing user: ${maskSensitive(cleanDriverName)} (${maskSensitive(accountingCode)})`);
        return existingDriverByName[0].id;
    }

    // 3. Créer un nouvel utilisateur + driver via Better-Auth
    const email = `${accountingCode.toLowerCase()}@drivers-temp.com`;
    const userId = await getOrCreateUserWithAuth(cleanDriverName, email, 'driver');
    
    if (!userId) {
        return null;
    }

    // Vérifier une dernière fois si un profil driver existe déjà pour cet utilisateur
    const existingDriverCheck = await db.select().from(drivers).where(eq(drivers.userId, userId)).limit(1);
    if (existingDriverCheck.length > 0) {
        // Mettre à jour le accountingCode si nécessaire
        if (existingDriverCheck[0].accountingCode !== accountingCode) {
            await db.update(drivers)
                .set({ accountingCode: accountingCode })
                .where(eq(drivers.id, existingDriverCheck[0].id));
        }
        return userId;
    }

    // Créer le profil driver
    const driverId = randomUUID();
    await db.insert(drivers).values({
        id: driverId,
        userId: userId,
        accountingCode: accountingCode,
        vehiclePlate: `PENDING-${accountingCode}`,
        vehicleType: 'unknown',
        available: true,
    });

    safeLog(`  ➕ Created driver: ${maskSensitive(cleanDriverName)} (${maskSensitive(accountingCode)})`);
    return userId;
}

/**
 * Get or create a production company
 */
async function getOrCreateProduction(productionName: string) {
    if (!productionName || productionName.trim() === '' || productionName.toUpperCase() === 'PAYE') {
        return null;
    }

    let productionId = productionName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    // Vérifier si la production existe déjà (par id)
    const existingProduction = await db.select().from(productions).where(eq(productions.id, productionId)).limit(1);

    if (existingProduction.length > 0) {
        // Vérifier si le projet générique existe pour cette production
        const genericProjectId = `${productionId}-general`;
        const existingGenericProject = await db.select()
            .from(projects)
            .where(and(
                eq(projects.id, genericProjectId),
                eq(projects.productionId, productionId)
            ))
            .limit(1);
        
        if (existingGenericProject.length === 0) {
            // Le projet générique n'existe pas encore, le créer
            try {
                await db.insert(projects).values({
                    id: genericProjectId,
                    name: `${productionName} - Générique`,
                    productionId: productionId,
                    isGeneric: true,
                    startDate: new Date(),
                    endDate: new Date(),
                });
                safeLog(`  ➕ Created generic project for existing production: ${maskSensitive(productionName)}`);
            } catch (error) {
                safeError(`Failed to create generic project for production ${maskSensitive(productionName)}:`, error);
                // Ce n'est pas bloquant, on peut continuer
            }
        }
        return existingProduction[0].id;
    }

    // Vérifier si la production existe par nom (au cas où l'id aurait été modifié)
    const existingProductionByName = await db.select().from(productions)
        .where(eq(productions.name, productionName))
        .limit(1);
    
    if (existingProductionByName.length > 0) {
        productionId = existingProductionByName[0].id;
        // Vérifier si le projet générique existe
        const genericProjectId = `${productionId}-general`;
        const existingGenericProject = await db.select()
            .from(projects)
            .where(and(
                eq(projects.id, genericProjectId),
                eq(projects.productionId, productionId)
            ))
            .limit(1);
        
        if (existingGenericProject.length === 0) {
            // Créer le projet générique
            try {
                await db.insert(projects).values({
                    id: genericProjectId,
                    name: `${productionName} - Générique`,
                    productionId: productionId,
                    isGeneric: true,
                    startDate: new Date(),
                    endDate: new Date(),
                });
                safeLog(`  ➕ Created generic project for existing production (by name): ${maskSensitive(productionName)}`);
            } catch (error) {
                safeError(`Failed to create generic project for production ${maskSensitive(productionName)}:`, error);
            }
        }
        return productionId;
    }

    // Créer la production + projet générique dans une transaction
    const genericProjectId = `${productionId}-general`;
    try {
        await db.transaction(async (tx) => {
            // Créer la production
            await tx.insert(productions).values({
                id: productionId,
                name: productionName,
                contactEmail: `${productionId}@production.com`,
            });

            // Créer le projet générique
            await tx.insert(projects).values({
                id: genericProjectId,
                name: `${productionName} - Générique`,
                productionId: productionId,
                isGeneric: true,
                startDate: new Date(),
                endDate: new Date(),
            });
        });

        safeLog(`  ➕ Created production: ${maskSensitive(productionName)} with generic project`);
        return productionId;
    } catch (error) {
        safeError(`Failed to create production ${maskSensitive(productionName)}:`, error);
        return null;
    }
}

/**
 * Gère btBc qui peut être un projet ou des responsables
 */
async function getOrCreateProjectOrManager(
    btBc: string,
    productionId: string | null
): Promise<{ projectId: string | null; managerNames: string[] }> {
    if (!btBc || btBc.trim() === '' || btBc.toUpperCase() === 'PAYE') {
        return { projectId: null, managerNames: [] };
    }

    const cleanBtBc = btBc.trim();

    // Si pas de production, on ne peut pas créer de projet
    // Tout ce qui est dans btBc sera traité comme des responsables
    if (!productionId) {
        if (cleanBtBc.includes('/')) {
            // Split par / et traiter tout comme des responsables
            const parts = cleanBtBc.split('/').map(p => p.trim()).filter(Boolean);
            return { projectId: null, managerNames: parts };
        }
        // btBc est un seul nom → responsable
        return { projectId: null, managerNames: [cleanBtBc] };
    }

    // Cas 1 : btBc contient "/" → format "PROJET/RESPONSABLE1/RESPONSABLE2..."
    if (cleanBtBc.includes('/')) {
        const parts = cleanBtBc.split('/').map(p => p.trim()).filter(Boolean);
        const projectName = parts[0];
        const managerNames = parts.slice(1); // Le reste = responsables

        let projectId: string | null = null;
        if (projectName) {
            // Vérifier si le projet existe déjà
            const existingProject = await db.select()
                .from(projects)
                .where(and(
                    eq(projects.name, projectName),
                    eq(projects.productionId, productionId)
                ))
                .limit(1);

            if (existingProject.length > 0) {
                projectId = existingProject[0].id;
            } else {
                // Créer le projet
                const projectSlug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                try {
                    await db.insert(projects).values({
                        id: projectSlug,
                        name: projectName,
                        productionId: productionId,
                        isGeneric: false,
                        startDate: new Date(),
                        endDate: new Date(),
                    });
                    projectId = projectSlug;
                    safeLog(`  ➕ Created project: ${maskSensitive(projectName)}`);
                } catch (error) {
                    safeError(`Failed to create project ${maskSensitive(projectName)}:`, error);
                    // Continuer sans le projet
                }
            }
        }
        return { projectId, managerNames };
    }

    // Cas 2 : btBc = "SALOME V" → uniquement un responsable
    return { projectId: null, managerNames: [cleanBtBc] };
}

/**
 * Get or create a project by name and production ID
 */
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

/**
 * Get or create a customer by name
 */
async function getOrCreateCustomer(customerName: string): Promise<string | null> {
    if (!customerName || customerName.trim() === '') {
        return null;
    }

    const cleanName = customerName.trim();

    // Rechercher le client (rôle customer)
    const existingCustomer = await db.select()
        .from(users)
        .where(and(
            eq(users.name, cleanName),
            eq(users.role, 'customer')
        ))
        .limit(1);

    if (existingCustomer.length > 0) {
        return existingCustomer[0].id;
    }

    // Créer un email unique
    const emailBase = cleanName.toLowerCase().replace(/\s+/g, '');
    const email = `${emailBase}@customers-temp.com`;

    // Récupérer ou créer via Better-Auth
    return getOrCreateUserWithAuth(cleanName, email, 'customer');
}

/**
 * Get or create a manager by name (rôle = customer pour l'instant)
 */
async function getOrCreateManager(managerName: string): Promise<string | null> {
    if (!managerName || managerName.trim() === '') {
        return null;
    }

    const cleanName = managerName.trim();

    // Vérifier si un manager existe déjà (peu importe le rôle pour l'instant)
    const existingManager = await db.select()
        .from(users)
        .where(eq(users.name, cleanName))
        .limit(1);

    if (existingManager.length > 0) {
        return existingManager[0].id;
    }

    // Créer un email unique
    const emailBase = cleanName.toLowerCase().replace(/\s+/g, '');
    const email = `${emailBase}@managers-temp.com`;

    // Récupérer ou créer via Better-Auth (rôle = customer pour l'instant)
    return getOrCreateUserWithAuth(cleanName, email, 'customer');
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
        
        // Create a Set of existing ride hashes for fast lookup (normalized timestamp)
        const existingRideHashes = new Set<string>();
        
        // First, create a map of driverId to accountingCode for existing drivers
        const driverAccountingCodes = new Map<string, string>();
        const driversList = await db.select().from(drivers);
        driversList.forEach(driver => {
            driverAccountingCodes.set(driver.id, driver.accountingCode ?? '');
        });
        
        existingRides.forEach(ride => {
            const normalizedDate = new Date(ride.departureTime).toISOString().slice(0, 16); // Precision to minutes
            
            // Récupérer l'accountingCode du driver pour le hash
            let driverIdentifier = '';
            if (ride.driverId) {
                // Essayer de récupérer depuis la map (driverId -> accountingCode)
                driverIdentifier = driverAccountingCodes.get(ride.driverId) ?? '';
            }
            // Si toujours vide, utiliser driverId ou une chaîne vide
            if (!driverIdentifier) {
                driverIdentifier = ride.driverId ?? '';
            }
            
            const rideHash = JSON.stringify({
                date: normalizedDate,
                depart: ride.departure,
                arrivee: ride.destination,
                driver: driverIdentifier || 'unknown',
                price: parseFloat(ride.price ?? '0'),
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
                // Skip rows without required data
                if (!row.depart || !row.arrivee || !row.jour) {
                    const reason = 'Missing required fields (departure, arrival, or date)';
                    console.log(`  ⏭️  Skipped: ${reason}`);
                    skippedRides.push({row: i + 1, name: row.nom || 'Unnamed', reason});
                    skipCount++;
                    continue;
                }
                
                // Formater les arrondissements de Paris (PXX → Paris XX)
                const formattedDepart = formatParisDistrict(row.depart);
                const formattedArrivee = formatParisDistrict(row.arrivee);
                
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
                const clientPrice = parsePrice(row.tarifClient);

                // Si tarifClient est présent dans le CSV, on l'utilise directement
                let finalPrice = clientPrice > 0 ? clientPrice : 0;

                // Sinon, on le calcule à partir de tarifChauffeur
                if (finalPrice === 0 && driverPrice > 0) {
                    finalPrice = calculateBilledPrice(driverPrice);
                    safeLog(`  💰 Calculated billed price: €${driverPrice} + 16% = €${finalPrice}`);
                }

                // Si le prix est toujours 0, c'est que les deux colonnes sont vides/mal formatées
                // On accepte 0 comme prix (comme demandé)
                if (finalPrice === 0) {
                    safeLog(`  ℹ️  No valid price found, setting price to 0 for ${maskSensitive(row.nom || 'Unnamed')}`);
                }
                
                // Check for duplicates - create hash of all ride data (normalized timestamp)
                const normalizedDepartureTime = departureTime.toISOString().slice(0, 16); // Precision to minutes
                const rideHash = JSON.stringify({
                    date: normalizedDepartureTime,
                    depart: formattedDepart,
                    arrivee: formattedArrivee,
                    driver: row.idChauffeur || 'unknown', // Use accountingCode from CSV for consistency
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
                
                // 1. Gérer la production
                let productionId: string | null = null;
                if (row.facturation && row.facturation.toUpperCase() !== 'PAYE') {
                    productionId = await getOrCreateProduction(row.facturation);
                    if (!productionId) {
                        safeWarn(`  ⚠️ Production already exists or failed to create: ${maskSensitive(row.facturation)}`);
                    }
                }

                // 2. Gérer btBc (projet + responsables)
                let projectId: string | null = null;
                const managerNames: string[] = [];
                if (row.btBc) {
                    const { projectId: resolvedProjectId, managerNames: resolvedManagerNames } =
                        await getOrCreateProjectOrManager(row.btBc, productionId);
                    projectId = resolvedProjectId;
                    managerNames.push(...resolvedManagerNames);
                }

                // 3. Si pas de projet spécifique, utiliser le projet générique de la production
                if (!projectId && productionId) {
                    const genericProject = await db.select()
                        .from(projects)
                        .where(and(
                            eq(projects.productionId, productionId),
                            eq(projects.isGeneric, true)
                        ))
                        .limit(1);
                    projectId = genericProject[0]?.id ?? null;
                }

                // 4. Créer les responsables (managers) s'ils n'existent pas
                const managerIds: string[] = [];
                for (const name of managerNames) {
                    const managerId = await getOrCreateManager(name);
                    if (managerId) managerIds.push(managerId);
                }

                // 5. Gérer les clients (split par /)
                const customerIds: string[] = [];
                if (row.nom) {
                    const customerNames = row.nom.split('/').map(name => name.trim()).filter(Boolean);
                    for (const name of customerNames) {
                        const customerId = await getOrCreateCustomer(name);
                        if (customerId) customerIds.push(customerId);
                    }
                }
                
                // 6. Gérer le chauffeur
                const driverUserId = await getOrCreateDriver(row.idChauffeur, row.chauffeur);
                let driverIdString: string | null = null;
                if (driverUserId) {
                    // Chercher d'abord par accountingCode (plus fiable)
                    const driverByAccountingCode = await db.select()
                        .from(drivers)
                        .where(eq(drivers.accountingCode, row.idChauffeur))
                        .limit(1);
                    
                    if (driverByAccountingCode.length > 0) {
                        driverIdString = driverByAccountingCode[0].id;
                    } else {
                        // Sinon, chercher par userId
                        const driverRecord = await db.select()
                            .from(drivers)
                            .where(eq(drivers.userId, driverUserId))
                            .limit(1);
                        driverIdString = driverRecord[0]?.id ?? null;
                    }
                }
                
                // 7. Notes (attente, courseEnvoye, etc.)
                const notes: string[] = [];
                if (row.attente) notes.push(`attente: ${row.attente}`);
                if (row.courseEnvoye && row.courseEnvoye !== row.chauffeur) {
                    notes.push(`dispatched to: ${row.courseEnvoye}`);
                }
                if (driverPrice > 0) notes.push(`Prix chauffeur: €${driverPrice.toFixed(2)}`);
                
                // 8. Insérer la course
                const [ride] = await db.insert(rides).values({
                    departure: formattedDepart,
                    destination: formattedArrivee,
                    departureTime: departureTime,
                    price: finalPrice.toString(),
                    driverPrice: driverPrice.toString(),
                    status: 'completed',
                    driverId: driverIdString,
                    projectId: projectId ?? undefined,
                    customerNotes: notes.length > 0 ? notes.join(' | ') : null,
                }).returning();

                // 9. Lier les clients (rideCustomers)
                if (customerIds.length > 0) {
                    await db.insert(rideCustomers).values(
                        customerIds.map(customerId => ({
                            rideId: ride.id,
                            customerId,
                        }))
                    );
                }

                // 10. Lier les responsables (rideManagers)
                if (managerIds.length > 0) {
                    await db.insert(rideManagers).values(
                        managerIds.map(managerId => ({
                            rideId: ride.id,
                            managerId,
                        }))
                    );
                }

                // Mark this ride as imported (add to duplicate check set)
                importedRides.add(rideHash);
                
                safeLog(`  ✅ Imported: ${maskSensitive(formattedDepart)} → ${maskSensitive(formattedArrivee)} (€${finalPrice.toFixed(2)})`);
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
