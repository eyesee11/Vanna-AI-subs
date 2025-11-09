/**
 * Test Setup Configuration
 * Initializes testing environment before running tests
 */

import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

// Clean up after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
