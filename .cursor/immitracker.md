# ImmiTracker MVP – Cursor Rule File

## 1. Code Standards
- **Tech Stack:**  
  - Backend: Node.js with Express  
  - Frontend: React with Redux (optionally TypeScript)
- **Coding Conventions:**  
  - Follow established style guides (e.g., Airbnb for JS)  
  - Use linters (ESLint, Prettier) for consistent formatting  
  - Write modular, maintainable code with clear separation of concerns  
- **Code Reviews:**  
  - All code must go through pull requests with mandatory reviews

## 2. Security Practices
- **Authentication:**  
  - Implement JWT-based authentication  
  - Store tokens securely (prefer HttpOnly cookies or secure storage)
- **Data Protection:**  
  - Enforce HTTPS for all communications  
  - Hash passwords using bcrypt; collect only minimal, non-personal data
- **Access Control:**  
  - Use role-based access control and validate tokens on every request  
  - Regularly update dependencies and perform security audits

## 3. Performance Requirements
- **Response Time:**  
  - Target Time-To-First-Byte (TTFB) < 200ms for most requests
- **Caching:**  
  - Use in-memory caching (Redis) for frequent queries  
  - Employ HTTP caching headers and a CDN for static assets
- **Database Optimization:**  
  - Index frequently queried columns; optimize queries to avoid full table scans
- **Resource Management:**  
  - Use connection pooling; monitor performance with APM tools

## 4. Development Workflow
- **Version Control:**  
  - Use Git with Gitflow; adopt clear branch naming conventions (feature/, bugfix/)
- **CI/CD:**  
  - Automate builds/tests with GitHub Actions (or similar tools)  
  - Enforce code reviews and block merges on failing tests
- **Release Strategy:**  
  - Tag releases semantically; maintain a CHANGELOG  
  - Automate deployment to staging and production environments

## 5. Testing Guidelines
- **Unit Testing:**  
  - Aim for ~80% coverage; use Jest/Mocha for testing functions/components
- **Integration Testing:**  
  - Test API endpoints and database interactions using Supertest (or similar)
- **Continuous Testing:**  
  - Integrate tests into CI/CD pipeline; enforce a minimum coverage threshold
- **Automated Regression Testing:**  
  - Run tests on every commit to catch regressions early

## 6. Deployment Strategy
- **Hosting:**  
  - Use cost-effective platforms (e.g., Heroku, DigitalOcean, or AWS Lightsail)
- **Scalability:**  
  - Start with a single instance; design servers to be stateless for horizontal scaling
- **Containerization:**  
  - Consider Docker for consistent deployments
- **Monitoring & Backups:**  
  - Set up basic monitoring (e.g., UptimeRobot, CloudWatch) and regular database backups

## 7. User Experience Rules
- **Accessibility:**  
  - Meet WCAG 2.1 AA standards; ensure keyboard navigation and proper ARIA labeling
- **Responsive Design:**  
  - Implement a mobile-first, fluid layout adaptable to mobile, tablet, and desktop views
- **Consistency:**  
  - Use a consistent design system (color palette, typography, UI components)  
  - Provide clear feedback (e.g., toasts, error messages) on user actions
- **Design System:**  
  - Maintain a shared style guide for reusable components and guidelines

## 8. Scalability Considerations
- **Modular Architecture:**  
  - Write modular code to ease future migration to microservices
- **Loose Coupling:**  
  - Ensure inter-module communication via well-defined APIs
- **Database Scalability:**  
  - Design the schema with proper normalization and indexing; plan for read replicas if necessary
- **Stateless Services:**  
  - Build servers to be stateless to simplify horizontal scaling
- **Future-Proofing:**  
  - Document design decisions and maintain a modular codebase for smooth evolution as the app grows