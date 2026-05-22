# CSV Import Tool for AMT Express

This tool imports ride data from CSV files into the AMT Express database.

## CSV Format

The CSV file should have the following columns (in order):

| Column            | Meaning                       | Example                    |
| ----------------- | ----------------------------- | -------------------------- |
| JOUR              | Date                          | "Monday, December 1, 2025" |
| HEURE             | Time/Hour to pick up          | "7.30"                     |
| FACTURATION       | Billing/Production company    | "WARNER"                   |
| BT/BC             | Project reference             | "THE EXPEDITION"           |
| NOM               | Client name(s)                | "ESTELLE MOSELY"           |
| DEPART            | Departure location            | "CDG"                      |
| ARRIVEE           | Arrival location              | "P18+CHAMPIGNY"            |
| ID CHAUFFEUR      | Driver ID                     | "CFR00132"                 |
| CHAUFFEUR         | Driver name                   | "TOUFIK ROMAINVILLE"       |
| COURSE ENVOYE     | Driver dispatched to          | "VAN / VIP / MISE A DISPO" |
| ATTENTE           | Notes (waiting time, options) | "VAN / VIP"                |
| TARIF CHAUFFEUR   | Driver price (with options)   | "120.00 €"                 |
| TARIF AGENDA      | Planned price                 | "€ 120.00"                 |
| TARIF CLIENT      | Final invoice price           | "€ 139.20"                 |
| FACT CHAUFFEUR    | Driver makes own invoice      | "FACT"                     |
| FORFAIT           | Flat rate price               | ""                         |
| ATTENTION MENTION | Additional notes              | "FACT AVOIR"               |

## Usage

### Prerequisites

1. Ensure you have a PostgreSQL database running
2. Configure your database connection in `.env`
3. Run migrations: `npm run db:push` or `pnpm db:push`

### Running the Import

```bash
# Using ts-node (recommended)
pnpm db:import-csv /path/to/your/file.csv
```

### Example

```bash
pnpm db:import-csv ~/Downloads/AGENDA-2025-DECEMBRE.csv
```

## What the Script Does

1. **Parses CSV** - Reads and parses the CSV file with proper handling of quoted fields
2. **Creates Drivers** - Automatically creates driver accounts if they don't exist
3. **Creates Productions** - Automatically creates production companies if they don't exist
4. **Imports Rides** - Creates ride records with:
   - Departure and arrival locations
   - Date and time
   - Driver assignment
   - Production company linkage
   - Final price (prioritizes: client price → planned price → driver price)
   - Customer notes including:
     - Wait time/options
     - Dispatched driver info
     - Flat rate info
     - Additional notes
     - Price breakdown

## Features

- **Smart Price Parsing**: Handles various currency formats (€, �, with/without spaces)
- **Date Parsing**: Supports French date format ("Monday, December 1, 2025")
- **Time Parsing**: Converts 24-hour time format (e.g., "7.30" = 07:30)
- **Skip Logic**: Automatically skips:
  - Cancelled rides (ANNULE)
  - Rides without required fields
  - Rides with invalid dates
  - Rides without valid prices
- **Auto-create**: Creates drivers and productions automatically if they don't exist
- **Detailed Logging**: Shows progress and summary of import

## Output

The script provides detailed output:

```
📂 CSV Ride Import Script

📄 Reading file: ~/Downloads/AGENDA-2025-DECEMBRE.csv

📋 Parsing CSV file...
✅ Found 150 ride(s) to import

[1/150] Processing ride: ESTELLE MOSELY
  ➕ Created driver: TOUFIK ROMAINVILLE (CFR00132)
  ➕ Created production: WARNER
  ✅ Imported: CDG → P18+CHAMPIGNY (€139.20)

...

==================================================
📊 Import Summary:
   ✅ Successfully imported: 120
   ⏭️  Skipped: 25
   ❌ Errors: 5
   📝 Total processed: 150
==================================================
```

## Database Impact

The import creates/updates:
- **users** table: New driver records with role='driver'
- **productions** table: New production companies
- **rides** table: New ride records with status='completed'

## Troubleshooting

### Error: "Please provide a CSV file path"
Make sure to pass the CSV file path as an argument.

### Error: "No valid rides found in CSV"
Check that your CSV has the correct column structure and data.

### Error: Database connection issues
Verify your `.env` file has correct database credentials:
```
DATABASE_URL="postgresql://user:password@localhost:5432/amt_express"
```

### Skipped rides
Check the console output to see why rides were skipped:
- Cancelled rides (ANNULE keyword)
- Missing required fields
- Invalid date formats
- No valid prices

## Notes

- The script sets all imported rides as `status='completed'`
- Drivers are created with auto-generated email: `{driverId}@amt-express.com`
- Production emails are auto-generated: `{production-id}@production.com`
- Duplicate driver/production checks prevent duplicates
- All prices are stored as decimals in the database
