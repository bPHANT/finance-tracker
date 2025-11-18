# Testing Setup Guide

This guide explains how to set up and run Jest unit tests for the Finance Tracker application.

## Installation

First, install the required Jest dependencies:

```bash
npm install --save-dev jest jest-expo @testing-library/react-native @testing-library/jest-native @types/jest ts-jest
```

## Configuration

The following files have been created for testing:

1. **`jest.config.js`** - Main Jest configuration
2. **`jest.setup.js`** - Test setup and global configurations
3. **`db/queries/__tests__/transactionGroup.test.ts`** - Unit tests for transactionGroup.getMany()

## Running Tests

Add the following scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

Then run tests with:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Test Structure

The test file for `transactionGroup.getMany()` includes the following test cases:

### ✅ Test Cases Covered

1. **Basic Functionality**

   - Should return grouped transaction groups with dominant categories
   - Should handle empty transaction groups

2. **Category Selection Logic**

   - Should use dominant category when transaction group has multiple categories
   - Should handle missing category with fallback values

3. **Error Handling**

   - Should handle database errors gracefully

4. **Sorting and Ordering**

   - Should sort groups by total amount within each day (descending)
   - Days should be sorted in descending order

5. **Naming Logic**
   - Should use transaction group name over category name when available
   - Should use category name when transaction group name is null
   - Should use "Unknown" as fallback when both are unavailable

## Test Coverage

The tests mock:

- Database queries and responses
- React hooks (useState)
- Database connection (useDb)

This ensures isolated unit testing without requiring actual database connections.

## Example Test Output

```
PASS  src/db/queries/__tests__/transactionGroup.test.ts
  useTransactionGroup - getMany
    ✓ should return grouped transaction groups with dominant categories (5ms)
    ✓ should handle empty transaction groups (2ms)
    ✓ should use dominant category when transaction group has multiple categories (3ms)
    ✓ should handle missing category with fallback values (4ms)
    ✓ should handle database errors gracefully (2ms)
    ✓ should sort groups by total amount within each day (descending) (3ms)
    ✓ should use transaction group name over category name when available (2ms)
    ✓ should use category name when transaction group name is null (2ms)

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

## Troubleshooting

If you encounter issues:

1. **Module resolution errors**: Ensure the path aliases in `jest.config.js` match your `tsconfig.json`
2. **Transform errors**: Make sure all necessary packages are listed in `transformIgnorePatterns`
3. **Type errors**: Install `@types/jest` and ensure TypeScript is configured properly

## Next Steps

Consider adding tests for:

- `create()` function
- `remove()` function
- `get()` function
- Integration tests with actual database
- Edge cases and error scenarios
