require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('password123', 12);
    const user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        passwordHash: hashedPassword,
        role: 'ADMIN'
      }
    });
    console.log('Test admin user created:', user);
  } catch (error) {
    console.error('Error creating test admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 