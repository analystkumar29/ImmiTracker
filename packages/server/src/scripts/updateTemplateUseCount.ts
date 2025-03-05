import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Updating template use count...');
    
    // Find the Background Check Complete template
    const template = await prisma.milestoneTemplate.findFirst({
      where: {
        name: 'Background Check Complete',
        programType: 'Economic Immigration',
        programSubType: 'Express Entry'
      }
    });
    
    if (!template) {
      console.log('Template not found!');
      return;
    }
    
    console.log(`Found template: "${template.name}" (${template.id})`);
    console.log(`Current useCount: ${template.useCount}, isApproved: ${template.isApproved}`);
    
    // Update to reach the threshold (3)
    const updatedTemplate = await prisma.milestoneTemplate.update({
      where: { id: template.id },
      data: { 
        useCount: 3,
        // Auto-approve if it reaches the threshold
        isApproved: true
      }
    });
    
    console.log(`Updated template: "${updatedTemplate.name}"`);
    console.log(`New useCount: ${updatedTemplate.useCount}, isApproved: ${updatedTemplate.isApproved}`);
    
    // First find the milestone using the templateId
    const milestone = await prisma.milestone.findFirst({
      where: { templateId: updatedTemplate.id }
    });
    
    if (!milestone) {
      console.log('Milestone not found!');
      return;
    }
    
    // Now update the milestone using its id
    const updatedMilestone = await prisma.milestone.update({
      where: { id: milestone.id },
      data: { isDefault: true }
    });
    
    console.log(`Updated milestone: "${updatedMilestone.name}"`);
    console.log(`New isDefault: ${updatedMilestone.isDefault}`);
    
  } catch (error) {
    console.error('Error updating template:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 