# CSV Import Tests

This directory contains comprehensive tests for the CSV import functionality.

## Running Tests

```bash
# Run all tests
pnpm test test/import-csv.test.ts

# Run tests in watch mode
pnpm test test/import-csv.test.ts --watch

# Run tests with coverage
pnpm test test/import-csv.test.ts --coverage
```

## Test Coverage

The test suite covers:

### 1. **Price Parsing** (`parsePrice`)
- ✅ Euro symbol after number: `"120.00 €"` → `120.00`
- ✅ Euro symbol before number: `"€ 139.20"` → `139.20`
- ✅ Comma as decimal separator: `"150,50 €"` → `150.50`
- ✅ Negative prices (returns absolute): `"-120.00 €"` → `120.00`
- ✅ Empty strings return `0`
- ✅ Malformed characters (�) return `0`
- ✅ Whitespace handling
- ✅ Prices without currency symbols
- ✅ Invalid strings return `0`

### 2. **Date Parsing** (`parseDate`)
- ✅ English date format: `"Monday, December 1, 2025"`
- ✅ Date with time: `"7.30"` → `7:30 AM`
- ✅ Date with afternoon time: `"14.45"` → `2:45 PM`
- ✅ Empty date strings return `null`
- ✅ Whitespace handling
- ✅ Date without time
- ✅ Malformed time handling
- ✅ Invalid dates return `null`

### 3. **CSV Line Parsing** (`parseCSVLine`)
- ✅ Simple CSV fields
- ✅ Quoted fields with commas
- ✅ Whitespace trimming
- ✅ Empty fields
- ✅ Quotes within quoted fields
- ✅ Single field parsing

### 4. **Full CSV File Parsing**
- ✅ Valid CSV file parsing
- ✅ Empty line skipping
- ✅ Header row handling
- ✅ Multiple data rows

### 5. **Data Validation**
- ✅ Cancelled ride identification (`ANNULE`)
- ✅ Missing required fields detection
- ✅ Price priority logic:
  - Client price → Planned price → Driver price
  - Falls back correctly when prices are `0`

### 6. **Customer Notes Building**
- ✅ Multiple field concatenation
- ✅ Wait/Options notes
- ✅ Dispatched driver info
- ✅ Flat rate info
- ✅ Additional attention mentions
- ✅ Prevents duplicate driver names

### 7. **Driver ID Handling**
- ✅ Valid driver ID processing
- ✅ Empty driver ID skipping
- ✅ `ANNULE` driver skipping

### 8. **Production ID Generation**
- ✅ Name normalization: `"WARNER BROS"` → `"warner-bros"`
- ✅ Special character handling
- ✅ Number handling
- ✅ Empty name handling

### 9. **Edge Cases**
- ✅ Multiple passengers: `"JOHN + JANE + BOB"`
- ✅ Complex locations: `"P18+CHAMPIGNY"`
- ✅ Airport codes: `CDG`, `ORLY`, `G NORD`, etc.
- ✅ VAN notation in notes
- ✅ Waiting time notation: `"ATT 30 MIN"`

## Test Structure

```
test/import-csv.test.ts
├── parsePrice tests (10 tests)
├── parseDate tests (8 tests)
├── parseCSVLine tests (6 tests)
├── Full CSV Parsing tests (2 tests)
├── Data Validation tests (4 tests)
├── Note Building tests (2 tests)
├── Driver ID Generation tests (3 tests)
├── Production ID Generation tests (4 tests)
└── Edge Cases tests (5 tests)
```

**Total: 44 comprehensive test cases**

## Mock Strategy

The tests use Vitest's mocking capabilities to:
- Mock the database module (`drizzle`)
- Mock database operations (`select`, `insert`)
- Mock the `eq` function from `drizzle-orm`

This ensures tests run without requiring a database connection.

## Adding New Tests

When adding new functionality to `import-csv.ts`, add corresponding tests:

1. Extract the function to test (or create a testable version)
2. Add a new `describe` block
3. Add `it` test cases covering:
   - Happy path (normal use)
   - Edge cases
   - Error conditions
   - Boundary values

Example:

```typescript
describe('CSV Import - New Feature', () => {
    it('should handle normal case', () => {
        // Test code
        expect(result).toBe(expected);
    });

    it('should handle edge case', () => {
        // Test code
        expect(result).toBe(expected);
    });

    it('should handle error condition', () => {
        // Test code
        expect(result).toBeNull();
    });
});
```

## Test Data

The tests use realistic data from the actual CSV format:
- French date formats
- Euro currency symbols
- Real driver IDs (CFR00XXX)
- Real production companies
- Real location codes

## Continuous Integration

These tests should be run:
- ✅ Before committing code
- ✅ In CI/CD pipeline
- ✅ Before deploying to production
- ✅ When modifying CSV import logic

## Troubleshooting

### Tests fail with "Cannot find module"
Make sure you're in the correct directory:
```bash
cd amt-express
pnpm test test/import-csv.test.ts
```

### Mock errors
If mocks aren't working, ensure:
1. Mocks are defined before imports
2. Module paths are correct
3. Vitest is properly configured

### File system tests fail
The temp file tests create files in the OS temp directory and clean them up automatically. If tests fail, check that your temp directory is writable.
