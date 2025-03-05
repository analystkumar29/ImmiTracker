# ImmiTracker – Product Requirements Document (PRD)

## Elevator Pitch
ImmiTracker is a crowdsourced, progressive web app that helps immigration applicants reduce anxiety during long application processes. Rather than replicating the official status portal, it allows users to anonymously contribute and compare key application milestone data—such as submission dates and update timings—so that they can see how their case compares to others in the same category. This provides real-time, aggregated insights on average processing times and predicted milestones.

## Target Users
- **Primary Users:** Immigration applicants (e.g., visitor visas, study permits, or PR) who want reassurance by comparing their application progress with peers.
- **Secondary Users:** Applicants who usually search through various WhatsApp groups or forums for updates and want a single, reliable source of crowd-sourced insights.

## Functional Requirements
- **Anonymous Data Collection:**  
  - Allow users to enter minimal data about their application: application type/sub-type, country, city, submission date, and subsequent update dates.
  - No personal details (e.g., name, personal identifiers) are required.
- **Application Tracking:**  
  - A simple, interactive vertical timeline that displays key milestones such as submission, biometric update, medical update, and any additional document requests.
  - Users can update milestone dates as their case progresses.
- **Peer Comparison & Predictive Insights:**  
  - Aggregate user data to calculate average processing times and trends.
  - Display comparisons showing how an individual’s timeline stacks up against aggregated data from similar cases (e.g., "Visitor Visa applicants from India in October").
  - Offer basic AI-driven predictions based on crowd-sourced data.
- **Community Engagement:**  
  - A basic forum and blog section where users can share insights, experiences, and tips.
- **Notifications:**  
  - Real-time alerts when significant updates occur or when it’s time to update a milestone.
- **Scalability & Extensibility:**  
  - The MVP is built with modularity in mind so that additional features (advanced analytics, private messaging, richer community features) can be added later without a complete overhaul.

## User Stories
- *As an applicant, I want to input minimal details about my application (type, submission date, update dates) so I can anonymously contribute data for peer comparison.*
- *As an applicant, I want to see a visual timeline of my case milestones and compare it with aggregated data from others in the same category, so I know if my case is progressing typically.*
- *As an applicant, I want to update milestone dates (e.g., when my biometric or medical exam is updated) so that the crowd-sourced data remains current and useful for predictions.*
- *As an applicant, I want to receive notifications when there’s an update or when it’s time to update my status, so I remain informed without having to check multiple platforms.*
- *As an applicant, I want access to a community forum and blog where I can read and share insights, reducing my need to search for information in disparate groups.*

## User Interface & Experience
- **Dashboard:** A clean, central hub displaying the user’s timeline with milestone entries and aggregated insights from similar applications.
- **Interactive Timeline:** A vertical timeline where each milestone is clearly marked and updateable, with indicators showing crowd-sourced averages and predictions.
- **Community & Blog:** Sections that let users browse discussion threads and read articles about immigration trends and tips.
- **Responsive Design:** A mobile-first approach that scales to desktop, ensuring easy navigation and readability across devices.

## Technical Considerations
- **Modular & Scalable Architecture:** Build with a monolithic structure that is internally modular—allowing later migration to microservices.
- **Affordable & Open Source:** Use cost-effective technologies (e.g., React, Node.js/Express, PostgreSQL) and affordable hosting (e.g., DigitalOcean, Heroku).
- **Data Privacy:** Since no personal details are required, the system focuses solely on aggregated, anonymous data.
- **Future Enhancements:** Design with future predictive analytics and richer community engagement features in mind.

## Retention & Engagement Strategies
- Timely notifications and alerts for milestone updates.
- Visual comparison and predictive insights to reduce anxiety.
- Community forum and blog to centralize valuable information.
- Gamified elements (e.g., digital badges) for users who consistently update their status.