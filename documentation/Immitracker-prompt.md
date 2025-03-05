# YOLO Agentic Mode Prompt for ImmiTracker Web App Creation

## Context and Reference Materials
You are now entering YOLO agentic mode. Your task is to autonomously drive the development process for the ImmiTracker web app until a fully functioning application is created. Use the following reference documents as foundational context for the project:

1. **ImmiTracker-product-requirement.md**  
   Contains the Product Requirements Document (PRD) detailing the core value proposition, user stories, and essential features of ImmiTracker.

2. **ImmiTracker-product-specification.md**  
   Provides the Custom Software Requirements Specification (SRS) with detailed technical architecture, API design, data flow, and database design (ERD).

3. **ImmiTracker-product-management.md**  
   Outlines the Project Management plan including milestones, roles, tasks, risks, budget, and timeline.

4. **ImmiTracker-UX-design.md**  
   Describes the UI/UX design including layout, structure, core components, interaction patterns, visual design elements, color scheme, typography, accessibility, and responsive design considerations.

## Your Mission
Using the provided documents as a complete reference, your mission is to autonomously work on and evolve the ImmiTracker web app through continuous iterations. You must:
- **Integrate and Prioritize Requirements:**  
  Analyze and combine the information from the four documents to set up a clear roadmap for development, ensuring the MVP is built first, with modularity for future enhancements.

- **Design & Code Iteratively:**  
  Continuously produce code and documentation, starting with a basic, functional web app that includes:
  - A responsive front-end (using React or a similar framework) that displays a personalized dashboard, interactive vertical timeline, and basic comparison features.
  - A back-end API (using Node.js/Express or a similar stack) that supports user submissions, data aggregation, and secure JWT-based authentication.
  - A PostgreSQL database schema to store anonymous application data and status updates.
  - Minimal community components (forum/blog) as placeholders to be expanded in future stages.
  
- **Ensure Continuous Improvement:**  
  Work iteratively: if any part is incomplete or requires refinement, re-examine requirements, produce improved code, and update documentation. Keep iterating until a complete, deployable version of the web app is available.

- **Follow Best Practices:**  
  Use industry-standard best practices for security, performance, accessibility, and scalability. Reference current best practices for PWA development, RESTful API design, and responsive UI/UX patterns.

- **Self-Monitor and Report:**  
  Periodically, log your progress and any decisions made to evolve the application. Ensure that each development iteration moves the project closer to a full-featured web app based on the MVP requirements.

## Specific Tasks
1. **Initial Setup:**  
   - Set up a project repository and development environment using your preferred tools.
   - Create the foundational structure based on the provided SRS (server, client, and database layers).

2. **Front-End Development:**  
   - Build a responsive SPA using a modern framework (e.g., React).
   - Implement the dashboard view with an interactive vertical timeline showing key milestones and aggregated peer data.
   - Ensure the UI is accessible, responsive, and adheres to the visual design guidelines from the UX document.

3. **Back-End/API Development:**  
   - Develop RESTful API endpoints for authentication, application data submission, and retrieving aggregated comparison data.
   - Integrate secure JWT-based authentication.
   - Ensure the API follows the design outlined in the product specification.

4. **Database Integration:**  
   - Set up the PostgreSQL database and implement the schema as described in the ERD.
   - Ensure proper relationships and indexing to support efficient queries.

5. **Iteration and Scaling:**  
   - Test each module thoroughly.
   - Iteratively add improvements, monitor performance, and refine the architecture to prepare for future features (such as advanced analytics or community enhancements).

## Expected Output
- A continuously evolving, deployable web app that meets the MVP requirements.
- Code and documentation that align with the four reference documents.
- Clear logs and iterative improvements demonstrating progress toward a complete solution.

---

Please proceed in YOLO agentic mode and continue working autonomously on ImmiTracker until a fully functional web app is created.