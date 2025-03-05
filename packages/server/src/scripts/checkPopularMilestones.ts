import { PrismaClient } from '@prisma/client';
import { MilestoneService } from '../services/milestone.service';

const prisma = new PrismaClient();
const milestoneService = new MilestoneService();

async function main() {
  try {
    console.log('Checking for popular custom milestones...');
    
    // Get popular milestones
    const popularMilestones = await milestoneService.getPopularCustomMilestones();
    
    console.log(`Found ${popularMilestones.length} popular milestone(s):`);
    popularMilestones.forEach((milestone, index) => {
      console.log(`${index + 1}. ${milestone.name} (${milestone.programType}) - Used ${milestone.useCount} times`);
    });
    
    // Promote popular milestones
    if (popularMilestones.length > 0) {
      const results = await milestoneService.promotePopularMilestones();
      
      console.log('Promotion results:');
      results.forEach((result, index) => {
        console.log(`${index + 1}. Template "${result.template}" - Updated ${result.milestonesUpdated} milestone(s)`);
      });
      
      const totalPromoted = results.reduce((sum, result) => sum + result.milestonesUpdated, 0);
      console.log(`Total milestones promoted to permanent status: ${totalPromoted}`);
    }
  } catch (error) {
    console.error('Error checking popular milestones:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 