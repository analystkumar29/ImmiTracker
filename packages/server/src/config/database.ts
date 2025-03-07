import { PrismaClient } from '@prisma/client';

// Create a singleton instance of the Prisma client
export const prisma = new PrismaClient();

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
}); 