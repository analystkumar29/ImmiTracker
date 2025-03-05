import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Inspecting milestone templates...');
    
    // Get all templates with their use counts
    const templates = await prisma.milestoneTemplate.findMany({
      orderBy: { useCount: 'desc' }
    });
    
    console.log(`Found ${templates.length} template(s):`);
    
    templates.forEach((template, index) => {
      console.log(
        `${index + 1}. "${template.name}" (${template.programType}/${template.programSubType || 'N/A'})` +
        `\n   Count: ${template.useCount}, Approved: ${template.isApproved}, ` +
        `ID: ${template.id}`
      );
    });
    
    // Find any templates that should be promoted
    const thresholdTemplates = templates.filter(t => t.useCount >= 3 && !t.isApproved);
    
    if (thresholdTemplates.length > 0) {
      console.log('\nTemplates that reached the threshold but are not approved:');
      thresholdTemplates.forEach((template, index) => {
        console.log(
          `${index + 1}. "${template.name}" (${template.programType}/${template.programSubType || 'N/A'})` +
          `\n   Count: ${template.useCount}, ID: ${template.id}`
        );
      });
    }
    
    // Get milestones using the "Background Check Complete" template
    const backgroundCheckTemplate = templates.find(t => 
      t.name === "Background Check Complete" && 
      t.programType === "Economic Immigration" &&
      t.programSubType === "Express Entry"
    );
    
    if (backgroundCheckTemplate) {
      console.log('\nMilestones using the "Background Check Complete" template:');
      const milestones = await prisma.milestone.findMany({
        where: { templateId: backgroundCheckTemplate.id }
      });
      
      milestones.forEach((milestone, index) => {
        console.log(
          `${index + 1}. "${milestone.name}" (${milestone.programType}/${milestone.programSubType || 'N/A'})` +
          `\n   isDefault: ${milestone.isDefault}, ID: ${milestone.id}`
        );
      });
    }
  } catch (error) {
    console.error('Error inspecting templates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();