/**
 * Database Backup Script
 * 
 * Creates a JSON backup of all database tables before migrations or imports.
 * This is a safety measure to allow rollback in case of import errors.
 * 
 * Usage: pnpm db:backup
 * 
 * Note: For production, consider using proper database dump tools (pg_dump for PostgreSQL)
 */

import db from '@/lib/db/drizzle';
import * as schema from '@/lib/db/schema';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

// Define all tables from schema
const tables = {
    users: schema.users,
    drivers: schema.drivers,
    productions: schema.productions,
    projects: schema.projects,
    rides: schema.rides,
    shiftPlanning: schema.shiftPlanning,
    rideOptions: schema.rideOptions,
    rideSelectedOptions: schema.rideSelectedOptions,
    rideCustomers: schema.rideCustomers,
    assignmentRequests: schema.assignmentRequests,
    invoices: schema.invoices,
    invoiceItems: schema.invoiceItems,
    notifications: schema.notifications,
    notificationPreferences: schema.notificationPreferences,
    activityLogs: schema.activityLogs,
    session: schema.session,
    account: schema.account,
    verification: schema.verification,
} as const;

// Type for table names
 type TableName = keyof typeof tables;

async function backupDatabase() {
    console.log('📦 Starting database backup...\n');
    
    try {
        // Create backups directory if it doesn't exist
        const backupsDir = join(process.cwd(), 'backups');
        if (!existsSync(backupsDir)) {
            mkdirSync(backupsDir, { recursive: true });
            console.log(`📁 Created backups directory: ${backupsDir}`);
        }
        
        // Generate filename with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = join(backupsDir, `db_backup_${timestamp}.json`);
        
        console.log(`💾 Backing up to: ${filename}`);
        
        // Backup each table
        const backup: Record<string, any[]> = {};
        let totalRecords = 0;
        
        for (const [tableName, table] of Object.entries(tables)) {
            console.log(`  📋 Backing up ${tableName}...`);
            try {
                const data = await db.select().from(table as any);
                backup[tableName] = data;
                totalRecords += data.length;
                console.log(`     ✅ ${data.length} records`);
            } catch (error) {
                console.error(`     ❌ Error backing up ${tableName}:`, error);
                backup[tableName] = [];
            }
        }
        
        // Write backup to file
        writeFileSync(filename, JSON.stringify(backup, null, 2));
        
        console.log(`\n✅ Backup completed successfully!`);
        console.log(`📊 Total records: ${totalRecords}`);
        console.log(`📄 File: ${filename}`);
        console.log(`\n💡 To restore this backup, you can:`);
        console.log(`   1. Review the JSON file for data integrity`);
        console.log(`   2. Write a restore script using the backup data`);
        console.log(`   3. Use database tools to import the data`);
        
    } catch (error) {
        console.error('❌ Backup failed:', error);
        process.exit(1);
    }
}

// Run the backup
backupDatabase();
