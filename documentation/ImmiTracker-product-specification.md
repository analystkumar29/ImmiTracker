# ImmiTracker – Custom Software Requirements Specification (SRS)

## System Design
- **Overview:**  
  - A Progressive Web App (PWA) with three main layers: Front-End (client-side UI), Back-End (API server), and Database.
  - The system collects and aggregates crowd-sourced application milestone data for peer comparison.
  - Emphasizes data anonymity and scalability for future feature enhancements.
- **Components:**  
  - **Front-End:** A React-based SPA delivering a responsive user experience across mobile, web, and desktop.
  - **Back-End:** A Node.js/Express server exposing RESTful endpoints.
  - **Database:** PostgreSQL for structured data storage.
  - **External Services:** Integration with push notification providers and third-party OAuth (if needed later).

## Architecture Pattern
- **Current Approach:**  
  - **Monolithic Architecture:** Single codebase structured with modular separation (Auth, Tracking, Notifications, Community) for simplicity and low cost.
- **Scalability:**  
  - Modular design enables future migration to microservices as the user base grows.
  - Use of containerization (Docker) and cloud-based auto-scaling to support increased load.
- **Hybrid Elements:**  
  - Serverless functions (e.g., for notifications) can be integrated as needed.

## State Management
- **Front-End:**  
  - Utilize Redux (or Redux Toolkit) for centralized state management, handling user data, application cases, and UI state.
  - Maintain local component state for transient interactions (e.g., form inputs).
  - Employ caching (e.g., redux-persist and service workers) for offline support.
- **Back-End:**  
  - Stateless API design with token-based authentication, ensuring that each request contains all necessary context.

## Data Flow
- **Client-Server Communication:**  
  - The front-end sends HTTP requests (GET, POST, PUT, DELETE) to the RESTful API.
  - The server processes requests (including user authentication) and interacts with PostgreSQL for data persistence.
  - Responses (in JSON) are sent back to the front-end, which updates the UI state accordingly.
- **Real-Time Updates:**  
  - Option to use WebSockets or polling for notifications and live data updates.
- **External Integration:**  
  - API endpoints may later incorporate external data sources (e.g., official status updates) via back-end services.

## Technical Stack
- **Front-End:**  
  - **React** (with Redux for state management, possibly TypeScript for type safety)
  - PWA features enabled by Service Workers (Workbox)
- **Back-End:**  
  - **Node.js** with **Express.js** (or NestJS for a more structured approach)
- **Database:**  
  - **PostgreSQL** with an ORM (e.g., Prisma or Sequelize) for data access
- **Hosting & Infrastructure:**  
  - Cloud platforms (Heroku, DigitalOcean, or AWS Lightsail) for cost-effective hosting
  - Docker for containerization and CI/CD pipelines (e.g., GitHub Actions)
- **Additional Tools:**  
  - Version control (Git), monitoring, and logging tools.

## Authentication Process
- **Method:**  
  - JWT-based authentication (with potential integration of Firebase Auth or OAuth for social logins in future).
- **Flow:**  
  - Users sign up (minimal data required) and log in with credentials.
  - Upon login, a JWT token is issued and stored client-side.
  - Protected API endpoints require the JWT in the Authorization header.
  - Role-based access control is implemented via claims in the JWT.
- **Security Measures:**  
  - Passwords hashed (e.g., bcrypt) and all communication secured over HTTPS.

## Route Design
- **Public Routes:**  
  - `/` – Landing page or marketing page  
  - `/login` – User login page  
  - `/signup` – Registration (if applicable)
- **Protected Routes:**  
  - `/dashboard` – User dashboard showing timeline and aggregated insights  
  - `/application/new` – Form to add a new application  
  - `/application/:id` – Detailed view of a specific application and its status timeline  
  - `/notifications` – Notification center  
  - `/profile` – User settings and preferences
- **Admin Routes (Future):**  
  - `/admin` – Dashboard for moderators/administrators for content and user management

## API Design
- **Style:**  
  - RESTful API endpoints using standard HTTP methods (GET, POST, PUT, DELETE).
- **Key Endpoints:**  
  - **Auth:**  
    - `POST /api/auth/register`  
    - `POST /api/auth/login`  
  - **User:**  
    - `GET /api/user`  
    - `PUT /api/user`  
  - **Applications:**  
    - `GET /api/applications`  
    - `POST /api/applications`  
    - `GET /api/applications/:id`  
    - `PUT /api/applications/:id`  
    - `DELETE /api/applications/:id`  
  - **Status Updates:**  
    - `GET /api/applications/:id/status`  
    - `POST /api/applications/:id/status`  
  - **Notifications:**  
    - `GET /api/notifications`  
- **Standards:**  
  - JSON for data exchange, versioning with `/api/v1/` if needed, appropriate HTTP status codes, and clear error handling.

## Database Design (ERD)
- **User:**  
  - Fields: `UserID` (PK), `Email`, `PasswordHash` (if applicable), `Role`, `CreatedAt`, `UpdatedAt`
- **Application:**  
  - Fields: `ApplicationID` (PK), `UserID` (FK), `Type`, `SubType`, `Country`, `City`, `SubmissionDate`, `CurrentStatus`, `CreatedAt`, `UpdatedAt`
- **StatusHistory:**  
  - Fields: `StatusID` (PK), `ApplicationID` (FK), `StatusName` (e.g., "Biometrics Updated"), `StatusDate`, `Notes`, `CreatedAt`
- **Notification:**  
  - Fields: `NotificationID` (PK), `UserID` (FK), `Type`, `Message`, `IsRead`, `CreatedAt`
- **Relationships:**  
  - **User-to-Application:** One-to-Many  
  - **Application-to-StatusHistory:** One-to-Many  
  - **User-to-Notification:** One-to-Many

This ERD supports tracking the progress of an application (via status history), linking each application to its owner, and enabling notifications for updates. The schema is designed to be extensible as more features (such as community posts or document storage) are added in later stages.