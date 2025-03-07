# ImmiTracker Milestone Management System

## Overview

The Milestone Management System is a core component of ImmiTracker that allows users to track the progress of their immigration applications through predefined and custom status updates. This document provides a comprehensive overview of how milestones are implemented, managed, and utilized throughout the application.

## Database Schema

### Core Models

The milestone system relies on several interconnected models in our PostgreSQL database:

**Milestone Model**
```prisma
model Milestone {
  id            String          @id @default(uuid())
  name          String
  description   String?
  programType   String          // e.g., "visitor_visa", "study_permit"
  programSubType String?        // Optional subtype
  isDefault     Boolean         @default(false)
  order         Int             @default(0)
  createdAt     DateTime        @default(now())
  updatedAt     DateTime        @updatedAt
  statusUpdates StatusHistory[]
  templateId    String?
  template      MilestoneTemplate? @relation(fields: [templateId], references: [id])

  @@map("milestones")
  @@index([programType, programSubType])
}
```

**MilestoneTemplate Model**
```prisma
model MilestoneTemplate {
  id            String      @id @default(uuid())
  name          String
  normalizedName String     // Lowercase, no spaces/special chars for matching
  description   String?
  programType   String      // e.g., "visitor_visa", "study_permit"
  programSubType String?    // Optional subtype
  isApproved    Boolean     @default(false)
  useCount      Int         @default(0)
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  createdById   String?
  createdBy     User?       @relation("CreatedBy", fields: [createdById], references: [id])
  milestones    Milestone[]

  @@map("milestone_templates")
  @@index([programType, programSubType])
  @@index([normalizedName])
}
```

**StatusHistory Model** (for connecting milestones to applications)
```prisma
model StatusHistory {
  id            String      @id @default(uuid())
  applicationId String
  statusName    String
  statusDate    DateTime
  notes         String?
  createdAt     DateTime    @default(now())
  application   Application @relation(fields: [applicationId], references: [id])
  milestoneId   String?
  milestone     Milestone?  @relation(fields: [milestoneId], references: [id])

  @@map("status_history")
}
```

### Model Relationships

- A **Milestone** can be associated with multiple **StatusHistory** entries.
- Each **Milestone** can be derived from a **MilestoneTemplate**.
- A **MilestoneTemplate** can be created by a **User** and used to create multiple **Milestone** instances.
- A **StatusHistory** entry belongs to an **Application** and can optionally reference a **Milestone**.

## Milestone System Architecture

### Key Components

1. **MilestoneService (Backend)**: Core service that handles milestone operations.
2. **MilestoneController (Backend)**: Handles API endpoints for milestone management.
3. **MilestoneUtils (Frontend)**: Utility functions for milestone data manipulation.
4. **Scheduled Tasks**: Background processes for milestone management.

### Design Philosophy

The milestone system follows these key design principles:

1. **Program-Specific Milestones**: Milestones are associated with specific immigration program types.
2. **Default vs. Custom Milestones**: Users can use predefined milestones or create custom ones.
3. **Crowdsourced Improvement**: Popular custom milestones can be promoted to default status.
4. **Duplicate Detection**: The system identifies similar milestones across different programs to improve data consistency.

## Implementation Approach

### Milestone Creation Process

1. **Default Milestones**: Predefined for each immigration program type during system initialization.
2. **Custom Milestones**: Created by users for their specific applications.
3. **Promotion System**: Custom milestones that reach a usage threshold are promoted to default status.

### Handling Duplicate Milestones

The system uses string normalization to detect duplicate or similar milestone names:

```javascript
// Server-side normalization
export const normalizeString = (str: string): string => {
  return str.toLowerCase().replace(/[^a-z0-9]/gi, '');
};

// Client-side normalization
export const normalizeMilestoneName = (name: string): string => {
  return name.toLowerCase().replace(/[^a-z0-9]/gi, '');
};
```

### Milestone Management Workflow

1. When creating a new application, default milestones are automatically added.
2. Users can add status updates using default or custom milestones.
3. Custom milestones are tracked for popularity.
4. Scheduled tasks run to promote popular milestones and identify duplicates.

## Key Functions and Features

### MilestoneService Functions

#### Creating and Managing Milestones

```typescript
// Creating a milestone template
async createMilestoneTemplate(data: {
  name: string;
  description?: string;
  programType: string;
  programSubType?: string;
  userId?: string;
}) {
  const normalizedName = normalizeString(data.name);
  
  // Check if a similar template already exists
  const existingTemplate = await prisma.milestoneTemplate.findFirst({
    where: {
      normalizedName,
      programType: data.programType,
      programSubType: data.programSubType,
    },
  });
  
  if (existingTemplate) {
    // Increment use count for existing template
    const updatedTemplate = await prisma.milestoneTemplate.update({
      where: { id: existingTemplate.id },
      data: { 
        useCount: { increment: 1 },
        isApproved: existingTemplate.useCount + 1 >= MILESTONE_APPROVAL_THRESHOLD 
          ? true 
          : existingTemplate.isApproved
      },
    });
    
    return updatedTemplate;
  }
  
  // Create new template
  return prisma.milestoneTemplate.create({
    data: {
      name: data.name,
      normalizedName,
      description: data.description,
      programType: data.programType,
      programSubType: data.programSubType,
      createdById: data.userId,
      isApproved: false,
      useCount: 1,
    },
  });
}
```

#### Finding and Promoting Popular Milestones

```typescript
// Get popular custom milestones
async getPopularCustomMilestones(threshold = MILESTONE_APPROVAL_THRESHOLD) {
  return prisma.milestoneTemplate.findMany({
    where: {
      useCount: { gte: threshold },
      isApproved: false
    },
    orderBy: {
      useCount: 'desc'
    }
  });
}

// Promote popular milestones to default status
async promotePopularMilestones(threshold = MILESTONE_APPROVAL_THRESHOLD) {
  const popularTemplates = await this.getPopularCustomMilestones(threshold);
  
  const results = [];
  
  for (const template of popularTemplates) {
    // Update template to approved status
    await prisma.milestoneTemplate.update({
      where: { id: template.id },
      data: { isApproved: true }
    });
    
    // Update milestones using this template
    const updatedMilestones = await prisma.milestone.updateMany({
      where: { templateId: template.id },
      data: { isDefault: true }
    });
    
    results.push({
      template: template.name,
      milestonesUpdated: updatedMilestones.count
    });
  }
  
  return results;
}
```

### Client-Side Utility Functions

#### Calculating Expected Milestone Dates

```typescript
export const calculateExpectedDates = (
  submissionDate: string | Date,
  processingTime?: string,
  milestones: string[] = []
): Record<string, string> => {
  if (!processingTime || !submissionDate || milestones.length === 0) {
    return {};
  }
  
  // Parse processing time
  const match = processingTime.match(/(\d+)[\s-]*(\w+)/);
  if (!match) return {};
  
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  
  // Convert to days
  let totalDays = 0;
  if (unit.includes('day')) {
    totalDays = amount;
  } else if (unit.includes('week')) {
    totalDays = amount * 7;
  } else if (unit.includes('month')) {
    totalDays = amount * 30;
  } else if (unit.includes('year')) {
    totalDays = amount * 365;
  }
  
  if (totalDays === 0) return {};
  
  // Calculate dates based on position in milestone sequence
  const submissionDateTime = new Date(submissionDate).getTime();
  const expectedDates: Record<string, string> = {};
  
  milestones.forEach((milestone, index) => {
    if (index === 0) return; // Skip first milestone
    
    const milestoneDays = Math.floor(totalDays * (index / milestones.length));
    const expectedDate = new Date(submissionDateTime + milestoneDays * 24 * 60 * 60 * 1000);
    
    expectedDates[milestone] = format(expectedDate, 'yyyy-MM-dd');
  });
  
  return expectedDates;
};
```

#### Creating Milestone Objects for UI

```typescript
export const createMilestoneObjects = (
  milestoneNames: string[],
  completedMilestones: Set<string>,
  statusHistory: StatusUpdate[] = [],
  expectedDates: Record<string, string> = {}
): Milestone[] => {
  return milestoneNames.map(name => {
    const completed = completedMilestones.has(name);
    const statusUpdate = statusHistory.find(status => status.statusName === name);
    
    return {
      name,
      completed,
      date: statusUpdate?.statusDate,
      notes: statusUpdate?.notes,
      expectedDate: !completed ? expectedDates[name] : undefined,
      isCustom: statusUpdate?.milestoneId ? true : false
    };
  });
};
```

## API Endpoints

The following API endpoints are available for milestone management:

### Public Endpoints
- `GET /milestones/program/:programType` - Get milestones for a program type
- `GET /milestones/templates/:programType` - Get milestone templates for a program type

### Protected Endpoints (User Authentication Required)
- `POST /milestones/custom` - Create a custom milestone
- `POST /milestones/order` - Update milestone order
- `DELETE /milestones/:id` - Delete a custom milestone

### Admin Endpoints
- `POST /milestones/template/:id/approve` - Approve a milestone template
- `POST /milestones/initialize` - Initialize default milestones
- `GET /milestones/duplicates` - Check for duplicate milestones
- `GET /milestones/popular` - Get popular custom milestones
- `POST /milestones/promote` - Promote popular milestones to defaults

## Scheduled Tasks

The system runs two scheduled tasks related to milestone management:

### Check and Promote Popular Milestones
```typescript
async function main() {
  try {
    console.log('Checking for popular custom milestones...');
    
    // Get popular milestones
    const popularMilestones = await milestoneService.getPopularCustomMilestones();
    
    // Promote popular milestones if any found
    if (popularMilestones.length > 0) {
      const results = await milestoneService.promotePopularMilestones();
      
      const totalPromoted = results.reduce((sum, result) => sum + result.milestonesUpdated, 0);
      console.log(`Total milestones promoted to permanent status: ${totalPromoted}`);
    }
  } catch (error) {
    console.error('Error checking popular milestones:', error);
  }
}
```

### Check for Duplicate Milestones
The system regularly scans for duplicate milestone names across different immigration programs to identify patterns and improve data quality.

## Current Challenges and Improvement Areas

### Duplicate Milestone Issue

As shown in the application logs, our system currently identifies numerous duplicate milestones across different immigration program types:

```
Found 26 duplicate milestones
Duplicate 1:
  Original: Application Submitted (study_permit)
  Duplicate: Application Submitted (work_permit)
Duplicate 2:
  Original: Biometrics Completed (study_permit)
  Duplicate: Biometrics Completed (work_permit)
...
```

### Proposed Improvements

1. **Unified Milestone Repository**: Create a global set of common milestones that can be shared across all immigration programs.
2. **Milestone Categories**: Add categorization to milestones to better organize them by purpose (e.g., Document Submission, Biometrics, Medical, Security).
3. **Advanced Analytics**: Use the milestone data to provide better processing time predictions.
4. **Milestone Dependencies**: Implement a system to define dependencies between milestones to create more accurate timelines.
5. **Milestone Standardization**: Implement a more robust system for normalizing and standardizing milestone names.

## Example Data Flow

### Creating a New Application with Default Milestones

1. User creates a new application (e.g., Study Permit)
2. System automatically adds default milestones for Study Permit:
   - Application Submitted
   - Biometrics Instruction Letter Received
   - Biometrics Completed
   - Medical Exam Required
   - Medical Exam Completed
   - Decision Made

### User Adding a Custom Milestone

1. User adds a custom milestone "Port of Entry Letter Received"
2. System creates a new milestone template with `useCount = 1` and `isApproved = false`
3. System adds the milestone to the application's status history

### Promoting Popular Custom Milestones

1. Several users add "Port of Entry Letter Received" to their Study Permit applications
2. The milestone template's `useCount` increases with each addition
3. When `useCount` reaches the threshold (default: 3), the scheduled task promotes it
4. The milestone template is updated with `isApproved = true`
5. All instances of this milestone are updated with `isDefault = true`
6. The milestone now appears as a default option for new Study Permit applications

## Conclusion

The Milestone Management System is a central feature of ImmiTracker that enables users to track their immigration application progress. By leveraging crowdsourced data and a flexible schema design, the system continuously improves to better serve users with more accurate and relevant milestone options.

The current implementation provides a solid foundation, but there are opportunities for improvement, particularly in handling duplicate milestones across different immigration programs and enhancing the prediction capabilities based on historical milestone data. 