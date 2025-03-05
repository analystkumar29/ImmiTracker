# ImmiTracker

ImmiTracker is a crowdsourced web application designed to help immigration applicants reduce anxiety during long application processes. It allows users to anonymously contribute and compare key application milestone data—such as submission dates and update timings—so they can see how their case compares to others in the same category.

## Features

- **Anonymous Application Tracking**: Track your immigration applications with minimal personal information
- **Program-Specific Milestones**: Each application type has its own set of milestones
- **Custom Milestone Management**: Add your own milestones and see them promoted if they become popular
- **Timeline Visualization**: Visual representation of your application's progress
- **Peer Comparison**: Compare your application timeline with aggregated data from similar cases
- **Community Insights**: Share experiences and tips with other applicants
- **JWT Authentication**: Secure user authentication and authorization

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

Run both frontend and backend in development mode:
```
npm run dev
```

Or run them separately:
```
npm run dev:client
npm run dev:server
```

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