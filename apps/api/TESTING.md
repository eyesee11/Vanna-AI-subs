# API Testing Guide

## Overview

Comprehensive Jest test suite for all API endpoints including stats, vendors, invoices, trends, categories, cash flow, chat, and health checks.

## Prerequisites

- Node.js 18+
- PostgreSQL database running
- Environment variables configured

## Running Tests

### Run All Tests

```bash
cd apps/api
npm test
```

### Watch Mode (for development)

```bash
npm run test:watch
```

### Generate Coverage Report

```bash
npm run test:coverage
```

## Test Structure

### Test Files

- `stats.test.ts` - Dashboard statistics endpoint tests
- `vendors.test.ts` - Top vendors by spend tests
- `invoices.test.ts` - Invoice listing, filtering, pagination tests
- `trends.test.ts` - Invoice volume and value trend tests
- `category.test.ts` - Spend by category tests
- `cashflow.test.ts` - Cash outflow forecast tests
- `chat.test.ts` - Natural language query tests
- `health.test.ts` - Health check and 404 handler tests

### Coverage Areas

- ✅ Response structure validation
- ✅ Data type validation
- ✅ Pagination logic
- ✅ Filtering and sorting
- ✅ Error handling
- ✅ Edge cases
- ✅ HTTP status codes
- ✅ API contract compliance

## Test Results Expected

- All endpoints return 200 status for valid requests
- Proper error handling with 400/500 status codes
- Correct JSON response structures
- Data validation and type checking
- Pagination and filtering work correctly

## Notes

- Tests use `supertest` for HTTP testing
- Database should be seeded before running tests
- Some tests may fail if Vanna AI server is not running (chat tests)
- Coverage reports are generated in `coverage/` directory
