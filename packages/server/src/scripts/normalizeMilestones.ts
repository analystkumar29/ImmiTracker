import { PrismaClient } from '@prisma/client';
import { MilestoneService } from '../services/milestone.service';
import { normalizeMilestoneName } from '../utils/milestoneNormalizer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const milestoneService = new MilestoneService();

async function normalizeMilestones() {
  console.log('Starting milestone normalization process...');

  try {
    // Step 1: Update all milestone templates with normalized names and categories
    console.log('Updating milestone templates with normalized names and categories...');
    const updateResult = await milestoneService.updateMilestoneNormalization();
    console.log(`Updated ${updateResult.updatedCount} milestone templates with normalized data`);

    // Step 2: Find and log duplicate milestones
    console.log('\nFinding duplicate milestones...');
    const duplicateGroups = await milestoneService.handleDuplicateMilestones();
    console.log(`Found ${duplicateGroups.length} groups of duplicate milestones`);

    // Step 3: Merge duplicate milestones if confirmed
    if (duplicateGroups.length > 0) {
      const shouldMerge = process.argv.includes('--merge');
      
      if (shouldMerge) {
        console.log('\nMerging duplicate milestones...');
        const mergeResults = await milestoneService.mergeDuplicates();
        console.log(`Merged ${mergeResults.length} groups of duplicate milestones`);
        
        // Log details of merged milestones
        mergeResults.forEach(result => {
          console.log(`- Merged ${result.mergedCount} duplicates into canonical milestone: ${result.normalizedName} (ID: ${result.canonicalId})`);
        });
      } else {
        console.log('\nTo merge duplicate milestones, run this script with the --merge flag');
        console.log('Example: npm run normalize-milestones -- --merge');
      }
    }

    console.log('\nMilestone normalization process completed successfully');
  } catch (error) {
    console.error('Error during milestone normalization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the normalization process
normalizeMilestones()
  .catch(error => {
    console.error('Unhandled error during milestone normalization:', error);
    process.exit(1);
  }); 