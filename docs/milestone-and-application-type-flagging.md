# Milestone and Application Type Flagging System

## Overview

The Milestone and Application Type Flagging System allows users to flag irrelevant or incorrect milestones and application types, helping to maintain data quality and relevance within ImmiTracker. This collaborative filtering feature improves the user experience by allowing the community to self-moderate and improve the data quality over time.

## Key Features

### For Regular Users

1. **Flag Irrelevant Milestones**: 
   - Users can flag milestone templates they find irrelevant or incorrect
   - Each milestone template tracks the number of flags it has received
   - When a milestone receives enough flags, it's automatically marked as unapproved

2. **Flag Irrelevant Application Types**:
   - Users can flag application types they find irrelevant or incorrect
   - Each application type tracks the number of flags it has received
   - Application types with many flags may be removed from default lists

3. **Add Custom Application Types**:
   - Users can add custom application types when they don't find an appropriate option
   - Popular custom types are automatically promoted to default status

### For Administrators

1. **Review Flagged Items**:
   - Administrators can view all flagged milestones and application types
   - Dashboard shows flag counts and allows for batch processing
   - Admins can approve or reject flagged items

2. **Process Flagged Items**:
   - Automated scheduled tasks process flagged items daily
   - Highly flagged milestones are marked as unapproved
   - Unused but highly flagged application types are marked as non-default

3. **Manage Application Types**:
   - Monitor the creation of new application types
   - Promote popular types to default status
   - Remove inappropriate or incorrect types

## How It Works

### Flagging Process

1. When viewing milestone templates or application types, users see a flag icon next to each item
2. Clicking the flag marks the item as flagged by that user
3. Users can only flag an item once
4. When a threshold (default: 3) is reached, the system takes action:
   - For milestones: marks them as unapproved and not default
   - For application types: marks unused types as non-default

### Application Type Management

1. Users create new application types when needed
2. Each time a type is used, its usage counter increases
3. Types reaching usage thresholds are promoted to default status
4. Flagged types with no active usage are demoted from default status

### Scheduled Tasks

The system runs several automated tasks:

- **Daily**: Process flagged milestones
- **Daily**: Process flagged application types
- **Daily**: Promote popular application types 
- **Daily**: Promote popular milestones
- **Weekly**: Check for duplicate milestones

## User Interface

### Flagging Interface

The flagging UI is integrated into:
- Milestone template selection dropdowns
- Application type selection menus
- Timeline views for applications

Each flaggable item displays:
- A flag icon that toggles between flagged/unflagged states
- Visual indicators showing how many times an item has been flagged

### Admin Dashboard

Administrators have access to:
- A dedicated "Flagged Items Manager" section
- Tabbed interface showing flagged milestones and application types
- Sort and filter options to identify problematic items
- Batch operations to process multiple flagged items

## Benefits

1. **Improved Data Quality**: Collaborative filtering helps identify and remove irrelevant or incorrect data
2. **User Empowerment**: Users can contribute to improving the system without admin privileges
3. **Reduced Admin Workload**: Automated processes handle routine moderation tasks
4. **Better User Experience**: Default lists stay relevant and useful

## Technical Implementation

The flagging system is implemented with:

- **Database**: Extended schema with relationships between users and flagged items
- **Backend**: Express.js services and controllers to handle flagging operations
- **Frontend**: React components with Material UI for the user interface
- **Scheduled Tasks**: Node.js scheduled tasks that run at configured intervals

## Future Enhancements

Planned improvements to the system include:

1. Machine learning to automatically identify potentially problematic items
2. User reputation system to weight flags based on user reliability
3. More detailed analytics on flagging patterns and trends
4. Additional notification systems for admins about flagged items 