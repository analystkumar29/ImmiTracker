# ImmiTracker

ImmiTracker is a comprehensive application for tracking immigration applications and milestones.

## Features

- **Anonymous Application Tracking**: Track your immigration applications with minimal personal information
- **Program-Specific Milestones**: Each application type has its own set of milestones
- **Custom Milestone Management**: Add your own milestones and see them promoted if they become popular
- **Timeline Visualization**: Visual representation of your application's progress
- **Peer Comparison**: Compare your application timeline with aggregated data from similar cases
- **Community Insights**: Share experiences and tips with other applicants
- **JWT Authentication**: Secure user authentication and authorization

## Recent Updates

### Enhanced Milestone Management

We've made significant improvements to the milestone management system:

1. **Standardized Update Status Dialog**
   - Consistent interface across all application views
   - Improved user experience for updating application statuses
   - Added ability to add custom milestones directly from the status update dialog

2. **Milestone Flagging System**
   - Users can now flag milestone templates that are not relevant to their immigration journey
   - Educational component explains the flagging process
   - Visual indicators show which milestones have been flagged
   - Flagged milestones are reviewed by administrators to improve the system

3. **Custom Milestone Creation**
   - Standardized dialog for adding custom milestones
   - Improved error handling and user feedback
   - Custom milestones are associated with specific application types

## How to Use the Milestone Flagging Feature

1. Navigate to any page where milestone templates are displayed
2. Look for the flag icon next to each milestone template
3. Click the flag icon to mark a milestone as irrelevant (it will turn red when flagged)
4. Click again to unflag if you change your mind
5. Our team reviews all flagged milestones to improve the system

## How to Update Application Status

1. From the Dashboard or Applications page, click the "Update Status" button for an application
2. Select a milestone from the dropdown list
3. Choose the date when the milestone was completed
4. Add optional notes about the milestone
5. Click "Save" to update the application status

## How to Add Custom Milestones

1. From the Update Status dialog, click "Add Custom Milestone"
2. Enter a name for your custom milestone
3. Click "Add Milestone" to create the milestone
4. The custom milestone will be added to your application and marked as completed

## Tech Stack

### Frontend
- React
- Redux for state management
- Material UI for components
- TypeScript for type safety
- Vite for build tooling

### Backend
- Node.js with Express
- PostgreSQL with Prisma ORM
- JWT for authentication
- TypeScript

## Project Structure

The project is organized as a monorepo with the following structure:

```
ImmiTracker/
├── packages/
│   ├── client/ (React frontend)
│   └── server/ (Express backend)
├── documentation/ (Project documentation)
└── .cursor/ (Project rules)
```

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)
- PostgreSQL (v13 or later)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/analystkumar29/ImmiTracker.git
   cd ImmiTracker
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` files in the server directory to `.env`
   - Update the values as needed (especially the database connection string)

4. Set up the database:
   ```
   cd packages/server
   npm run prisma:migrate
   npm run prisma:generate
   npm run seed:milestones
   ```

### Running the Application

To start the application in development mode:

```bash
npm run dev
```

This will start both the client and server concurrently. The client will be available at http://localhost:5174/ and the server at http://localhost:3004/.

## Key Features in Detail

### Milestone Management

ImmiTracker offers a sophisticated milestone management system:

- Each application type has its own set of appropriate milestones
- Users can add custom milestones specific to their application
- Popular custom milestones are automatically promoted to permanent status
- Duplicate milestone detection prevents redundancy
- Scheduled tasks maintain milestone data integrity

### Application Dashboard

The dashboard provides:

- Current application status with timeline view
- Estimated processing times based on aggregated data
- Comparison with similar applications
- Visual progress indicators

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Applications
- `GET /api/applications` - Get user's applications
- `POST /api/applications` - Create a new application
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id` - Update application
- `POST /api/applications/:id/status` - Update application status

### Milestones
- `GET /api/milestones` - Get milestones for a program
- `POST /api/milestones/custom` - Add custom milestone
- `GET /api/milestones/popular` - Get popular custom milestones

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Special thanks to all contributors and users providing valuable feedback
- Immigration authorities for making the process complex enough to require this tool 😉 