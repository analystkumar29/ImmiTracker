import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('Creating test user...');
    
    // Check if test user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        email: 'test@example.com',
      },
    });

    if (existingUser) {
      console.log('Test user already exists!');
      return;
    }

    // Create a new test user
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const newUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        passwordHash,
        role: 'USER',
      },
    });
    
    console.log('Test user created successfully:', newUser.id);
  } catch (error) {
    console.error('Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 