import { PrismaClient } from '@prisma/client';
import { immigrationPrograms } from '../data/immigrationPrograms';
import { normalizeString } from '../utils/stringUtils';

const prisma = new PrismaClient();

/**
 * Seed default milestones for all immigration programs
 */
async function seedMilestones() {
  console.log('Starting milestone seeding...');
  
  try {
    // Create milestone templates and milestones for each program
    for (const program of immigrationPrograms) {
      console.log(`Processing program: ${program.programName} (${program.id})`);
      
      // Create milestone templates
      const templates = await Promise.all(
        program.milestoneUpdates.map(async (milestoneName) => {
          const normalizedName = normalizeString(milestoneName);
          
          // Check if template already exists
          const existingTemplate = await prisma.milestoneTemplate.findFirst({
            where: {
              normalizedName,
              programType: program.id,
            },
          });
          
          if (existingTemplate) {
            console.log(`Template already exists: ${milestoneName}`);
            return existingTemplate;
          }
          
          // Create new template
          const template = await prisma.milestoneTemplate.create({
            data: {
              name: milestoneName,
              normalizedName,
              programType: program.id,
              isApproved: true, // Default templates are approved
            },
          });
          
          console.log(`Created template: ${milestoneName}`);
          return template;
        })
      );
      
      // Delete existing default milestones for this program
      const deletedCount = await prisma.milestone.deleteMany({
        where: {
          programType: program.id,
          isDefault: true,
        },
      });
      
      console.log(`Deleted ${deletedCount.count} existing milestones for ${program.id}`);
      
      // Create milestones
      const milestones = await Promise.all(
        templates.map(async (template, index) => {
          return prisma.milestone.create({
            data: {
              name: template.name,
              programType: program.id,
              isDefault: true,
              order: index,
              templateId: template.id,
            },
          });
        })
      );
      
      console.log(`Created ${milestones.length} milestones for ${program.id}`);
    }
    
    console.log('Milestone seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding milestones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMilestones()
  .catch((error) => {
    console.error('Unhandled error during seeding:', error);
    process.exit(1);
  }); 