# ImmiTracker API Documentation

## Overview

This document provides detailed information about ImmiTracker's API endpoints with sample requests and responses to facilitate integration and development. The API follows RESTful principles and uses JWT for authentication.

## Base URL

```
http://localhost:3001/api
```

## Authentication

### 1. Register User

Creates a new user account.

- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePassword123"
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "a931f8b6-b3c6-4b8a-8662-6af1c9ba17c8",
    "email": "newuser@example.com",
    "role": "USER",
    "createdAt": "2023-06-15T10:23:45.123Z"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Email already in use"
}
```

### 2. User Login

Authenticates a user and returns a JWT token.

- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "YourPassword123"
}
```

**Success Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "b721f8c5-d2a6-4c8a-9562-5af1c9ba17c8",
    "email": "user@example.com",
    "role": "USER"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

## Application Management

### 1. Create Application

Creates a new immigration application.

- **URL**: `/applications`
- **Method**: `POST`
- **Auth Required**: Yes (JWT token in header)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "type": "Economic Immigration",
  "subType": "Express Entry",
  "country": "Canada",
  "city": "Toronto",
  "submissionDate": "2023-03-01"
}
```

**Success Response:**
```json
{
  "id": "c4ea0113-fb48-4ae0-84a9-814baa5546e3",
  "type": "Economic Immigration",
  "subType": "Express Entry",
  "country": "Canada",
  "city": "Toronto",
  "submissionDate": "2023-03-01T00:00:00.000Z",
  "currentStatus": "Submitted",
  "userId": "b721f8c5-d2a6-4c8a-9562-5af1c9ba17c8",
  "createdAt": "2023-06-15T14:27:35.123Z",
  "updatedAt": "2023-06-15T14:27:35.123Z",
  "statusHistory": [
    {
      "id": "d2ae3c45-fb70-4d68-9bc1-567ea9874f12",
      "applicationId": "c4ea0113-fb48-4ae0-84a9-814baa5546e3",
      "statusName": "Application Submitted",
      "statusDate": "2023-06-15T14:27:35.123Z",
      "notes": "Application submitted successfully",
      "createdAt": "2023-06-15T14:27:35.123Z"
    },
    {
      "id": "e3ba2d65-fa20-4b68-9cd3-765ea9874f15",
      "applicationId": "c4ea0113-fb48-4ae0-84a9-814baa5546e3",
      "statusName": "Background Check Complete",
      "statusDate": "2023-06-15T14:27:35.123Z",
      "notes": "Default milestone: Background Check Complete",
      "milestoneId": "dbfd08a2-da4e-4b5e-9dd7-abd60374ff69",
      "createdAt": "2023-06-15T14:27:35.123Z"
    }
  ]
}
```

### 2. Get All Applications

Retrieves all applications for the authenticated user.

- **URL**: `/applications`
- **Method**: `GET`
- **Auth Required**: Yes (JWT token in header)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response:**
```json
[
  {
    "id": "c4ea0113-fb48-4ae0-84a9-814baa5546e3",
    "type": "Economic Immigration",
    "subType": "Express Entry",
    "country": "Canada",
    "city": "Toronto",
    "submissionDate": "2023-03-01T00:00:00.000Z",
    "currentStatus": "Background Check Complete",
    "userId": "b721f8c5-d2a6-4c8a-9562-5af1c9ba17c8",
    "createdAt": "2023-06-15T14:27:35.123Z",
    "updatedAt": "2023-06-15T14:27:35.123Z",
    "statusHistory": [
      {
        "id": "d2ae3c45-fb70-4d68-9bc1-567ea9874f12",
        "applicationId": "c4ea0113-fb48-4ae0-84a9-814baa5546e3",
        "statusName": "Application Submitted",
        "statusDate": "2023-06-15T14:27:35.123Z",
        "notes": "Application submitted successfully",
        "createdAt": "2023-06-15T14:27:35.123Z"
      },
      {
        "id": "e3ba2d65-fa20-4b68-9cd3-765ea9874f15",
        "applicationId": "c4ea0113-fb48-4ae0-84a9-814baa5546e3",
        "statusName": "Background Check Complete",
        "statusDate": "2023-06-15T14:27:35.123Z",
        "notes": "Default milestone: Background Check Complete",
        "milestoneId": "dbfd08a2-da4e-4b5e-9dd7-abd60374ff69",
        "createdAt": "2023-06-15T14:27:35.123Z"
      }
    ]
  },
  {
    "id": "52d03fe5-62c7-449f-bae7-7559c5f7e04e",
    "type": "Temporary Residence",
    "subType": "Study Permit",
    "country": "Canada",
    "city": "Vancouver",
    "submissionDate": "2023-02-15T00:00:00.000Z",
    "currentStatus": "Biometrics Completed",
    "userId": "b721f8c5-d2a6-4c8a-9562-5af1c9ba17c8",
    "createdAt": "2023-06-10T09:15:22.123Z",
    "updatedAt": "2023-06-12T11:30:45.123Z",
    "statusHistory": [
      {
        "id": "f4ca5d67-ec80-4c68-9ea2-845ea9874f18",
        "applicationId": "52d03fe5-62c7-449f-bae7-7559c5f7e04e",
        "statusName": "Application Submitted",
        "statusDate": "2023-06-10T09:15:22.123Z",
        "notes": "Application submitted successfully",
        "createdAt": "2023-06-10T09:15:22.123Z"
      },
      {
        "id": "g5da6e78-fd90-4d68-9fb2-932ea9874f21",
        "applicationId": "52d03fe5-62c7-449f-bae7-7559c5f7e04e",
        "statusName": "Biometrics Completed",
        "statusDate": "2023-06-12T11:30:45.123Z",
        "notes": "Biometrics completed at local visa center",
        "milestoneId": "3f7b2c18-ca5e-4d3f-8ba6-12d904e8f7a9",
        "createdAt": "2023-06-12T11:30:45.123Z"
      }
    ]
  }
]
```

### 3. Get Application Details

Retrieves details for a specific application.

- **URL**: `/applications/:id`
- **Method**: `GET`
- **Auth Required**: Yes (JWT token in header)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response:**
```json
{
  "id": "c4ea0113-fb48-4ae0-84a9-814baa5546e3",
  "type": "Economic Immigration",
  "subType": "Express Entry",
  "country": "Canada",
  "city": "Toronto",
  "submissionDate": "2023-03-01T00:00:00.000Z",
  "currentStatus": "Background Check Complete",
  "userId": "b721f8c5-d2a6-4c8a-9562-5af1c9ba17c8",
  "createdAt": "2023-06-15T14:27:35.123Z",
  "updatedAt": "2023-06-15T14:27:35.123Z",
  "statusHistory": [
    {
      "id": "d2ae3c45-fb70-4d68-9bc1-567ea9874f12",
      "applicationId": "c4ea0113-fb48-4ae0-84a9-814baa5546e3",
      "statusName": "Application Submitted",
      "statusDate": "2023-06-15T14:27:35.123Z",
      "notes": "Application submitted successfully",
      "createdAt": "2023-06-15T14:27:35.123Z"
    },
    {
      "id": "e3ba2d65-fa20-4b68-9cd3-765ea9874f15",
      "applicationId": "c4ea0113-fb48-4ae0-84a9-814baa5546e3",
      "statusName": "Background Check Complete",
      "statusDate": "2023-06-15T14:27:35.123Z",
      "notes": "Default milestone: Background Check Complete",
      "milestoneId": "dbfd08a2-da4e-4b5e-9dd7-abd60374ff69",
      "createdAt": "2023-06-15T14:27:35.123Z"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Application not found"
}
```

### 4. Update Application Status

Adds a new status update to an application.

- **URL**: `/applications/:id/status`
- **Method**: `POST`
- **Auth Required**: Yes (JWT token in header)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "statusName": "Medical Exam Passed",
  "statusDate": "2023-06-20",
  "notes": "Received confirmation of medical exam approval",
  "milestoneId": "7a2c3d8b-fb45-4c2a-9de3-123f56789abc"
}
```

**Success Response:**
```json
{
  "success": true,
  "application": {
    "id": "c4ea0113-fb48-4ae0-84a9-814baa5546e3",
    "type": "Economic Immigration",
    "subType": "Express Entry",
    "country": "Canada",
    "city": "Toronto",
    "submissionDate": "2023-03-01T00:00:00.000Z",
    "currentStatus": "Medical Exam Passed",
    "userId": "b721f8c5-d2a6-4c8a-9562-5af1c9ba17c8",
    "createdAt": "2023-06-15T14:27:35.123Z",
    "updatedAt": "2023-06-20T16:45:22.123Z",
    "statusHistory": [
      {
        "id": "d2ae3c45-fb70-4d68-9bc1-567ea9874f12",
        "applicationId": "c4ea0113-fb48-4ae0-84a9-814baa5546e3",
        "statusName": "Application Submitted",
        "statusDate": "2023-06-15T14:27:35.123Z",
        "notes": "Application submitted successfully",
        "createdAt": "2023-06-15T14:27:35.123Z"
      },
      {
        "id": "e3ba2d65-fa20-4b68-9cd3-765ea9874f15",
        "applicationId": "c4ea0113-fb48-4ae0-84a9-814baa5546e3",
        "statusName": "Background Check Complete",
        "statusDate": "2023-06-15T14:27:35.123Z",
        "notes": "Default milestone: Background Check Complete",
        "milestoneId": "dbfd08a2-da4e-4b5e-9dd7-abd60374ff69",
        "createdAt": "2023-06-15T14:27:35.123Z"
      },
      {
        "id": "h6eb7f89-fe10-4e68-9gc2-012fb9874f24",
        "applicationId": "c4ea0113-fb48-4ae0-84a9-814baa5546e3",
        "statusName": "Medical Exam Passed",
        "statusDate": "2023-06-20T00:00:00.000Z",
        "notes": "Received confirmation of medical exam approval",
        "milestoneId": "7a2c3d8b-fb45-4c2a-9de3-123f56789abc",
        "createdAt": "2023-06-20T16:45:22.123Z"
      }
    ]
  }
}
```

### 5. Delete Application

Deletes an application and all associated status history.

- **URL**: `/applications/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes (JWT token in header)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response:**
```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Application not found or you don't have permission to delete it"
}
```

## Milestone Management

### 1. Get Milestones for Program

Retrieves milestones for a specific program type/subtype.

- **URL**: `/milestones`
- **Method**: `GET`
- **Auth Required**: Yes (JWT token in header)
- **Query Parameters**: `programType`, `programSubType` (optional)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request URL Example:**
```
/api/milestones?programType=Economic%20Immigration&programSubType=Express%20Entry
```

**Success Response:**
```json
[
  {
    "id": "dbfd08a2-da4e-4b5e-9dd7-abd60374ff69",
    "name": "Background Check Complete",
    "description": "Security and background verification completed",
    "programType": "Economic Immigration",
    "programSubType": "Express Entry",
    "isDefault": true,
    "order": 1,
    "createdAt": "2023-05-10T08:20:15.123Z",
    "updatedAt": "2023-05-10T08:20:15.123Z"
  },
  {
    "id": "7a2c3d8b-fb45-4c2a-9de3-123f56789abc",
    "name": "Medical Exam Passed",
    "description": "Medical examination completed and passed",
    "programType": "Economic Immigration",
    "programSubType": "Express Entry",
    "isDefault": true,
    "order": 2,
    "createdAt": "2023-05-10T08:20:15.123Z",
    "updatedAt": "2023-05-10T08:20:15.123Z"
  },
  {
    "id": "9e5f6a2b-cd34-4e2f-ab12-456g78901def",
    "name": "COPR Issued",
    "description": "Confirmation of Permanent Residence document issued",
    "programType": "Economic Immigration",
    "programSubType": "Express Entry",
    "isDefault": true,
    "order": 3,
    "createdAt": "2023-05-10T08:20:15.123Z",
    "updatedAt": "2023-05-10T08:20:15.123Z"
  }
]
```

### 2. Get Milestone Templates

Retrieves milestone templates for a specific program type/subtype.

- **URL**: `/milestones/templates`
- **Method**: `GET`
- **Auth Required**: Yes (JWT token in header)
- **Query Parameters**: `programType`, `programSubType` (optional), `includeUnapproved` (optional, default: false)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request URL Example:**
```
/api/milestones/templates?programType=Economic%20Immigration&programSubType=Express%20Entry&includeUnapproved=true
```

**Success Response:**
```json
[
  {
    "id": "1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p",
    "name": "Biometrics Completed",
    "description": "Biometric information collected and verified",
    "programType": "Economic Immigration",
    "programSubType": "Express Entry",
    "isApproved": true,
    "useCount": 42,
    "createdAt": "2023-05-10T08:20:15.123Z",
    "updatedAt": "2023-05-10T08:20:15.123Z"
  },
  {
    "id": "2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q",
    "name": "Language Test Results Received",
    "description": "IELTS or CELPIP test results received",
    "programType": "Economic Immigration",
    "programSubType": "Express Entry",
    "isApproved": false,
    "useCount": 2,
    "createdAt": "2023-06-05T14:30:22.123Z",
    "updatedAt": "2023-06-05T14:30:22.123Z"
  }
]
```

### 3. Create Custom Milestone

Creates a custom milestone for a specific program type/subtype.

- **URL**: `/milestones/custom`
- **Method**: `POST`
- **Auth Required**: Yes (JWT token in header)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "name": "ECA Results Received",
  "description": "Educational Credential Assessment results received",
  "programType": "Economic Immigration",
  "programSubType": "Express Entry"
}
```

**Success Response:**
```json
{
  "success": true,
  "milestone": {
    "id": "3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r",
    "name": "ECA Results Received",
    "description": "Educational Credential Assessment results received",
    "programType": "Economic Immigration",
    "programSubType": "Express Entry",
    "isApproved": false,
    "useCount": 1,
    "userId": "b721f8c5-d2a6-4c8a-9562-5af1c9ba17c8",
    "createdAt": "2023-06-25T11:15:33.123Z",
    "updatedAt": "2023-06-25T11:15:33.123Z"
  }
}
```

### 4. Get Popular Milestones

Retrieves popular custom milestones that could be promoted to defaults.

- **URL**: `/milestones/popular`
- **Method**: `GET`
- **Auth Required**: Yes (JWT token in header)
- **Query Parameters**: `threshold` (optional, default: 3)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request URL Example:**
```
/api/milestones/popular?threshold=3
```

**Success Response:**
```json
[
  {
    "id": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
    "name": "Police Certificate Received",
    "description": "Police clearance certificate received",
    "programType": "Economic Immigration",
    "programSubType": "PNP",
    "isApproved": false,
    "useCount": 5,
    "createdAt": "2023-05-18T09:40:12.123Z",
    "updatedAt": "2023-06-20T15:22:45.123Z"
  },
  {
    "id": "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
    "name": "Invitation to Apply (ITA) Received",
    "description": "Invitation to apply for permanent residence received",
    "programType": "Economic Immigration",
    "programSubType": "Express Entry",
    "isApproved": false,
    "useCount": 4,
    "createdAt": "2023-05-25T13:50:30.123Z",
    "updatedAt": "2023-06-22T10:15:18.123Z"
  }
]
```

### 5. Promote Popular Milestones

Promotes popular custom milestone templates to default milestones.

- **URL**: `/milestones/promote`
- **Method**: `POST`
- **Auth Required**: Yes (JWT token in header) with ADMIN role
- **Query Parameters**: `threshold` (optional, default: 3)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request URL Example:**
```
/api/milestones/promote?threshold=3
```

**Success Response:**
```json
{
  "success": true,
  "promotedCount": 2,
  "promotedMilestones": [
    {
      "id": "4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s",
      "name": "Police Certificate Received",
      "programType": "Economic Immigration",
      "programSubType": "PNP",
      "useCount": 5
    },
    {
      "id": "5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t",
      "name": "Invitation to Apply (ITA) Received",
      "programType": "Economic Immigration",
      "programSubType": "Express Entry",
      "useCount": 4
    }
  ]
}
```

## Program Information

### 1. Get All Programs

Retrieves information about all immigration programs.

- **URL**: `/programs`
- **Method**: `GET`
- **Auth Required**: Yes (JWT token in header)

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response:**
```json
[
  {
    "id": "ee-fsw",
    "programName": "Federal Skilled Worker",
    "category": "Permanent Residence",
    "description": "Program for skilled workers with foreign work experience who want to immigrate to Canada permanently.",
    "visaOffices": "Various global visa offices",
    "milestoneUpdates": [
      "Profile Created",
      "ITA Received",
      "AOR",
      "Biometrics Completed",
      "Medical Passed",
      "Background Check",
      "COPR Issued"
    ],
    "processingTimes": {
      "exampleCountries": {
        "India": "6-8 months",
        "Philippines": "6-12 months",
        "Nigeria": "8-14 months"
      }
    }
  },
  {
    "id": "study-permit",
    "programName": "Study Permit",
    "category": "Temporary Residence",
    "description": "Permit allowing foreign nationals to study at designated learning institutions in Canada.",
    "visaOffices": "Various global visa offices",
    "milestoneUpdates": [
      "Application Submitted",
      "Biometrics Instruction Received",
      "Biometrics Completed",
      "Medical Exam Required",
      "Medical Exam Completed",
      "Additional Documents Requested",
      "Decision Made"
    ],
    "processingTimes": {
      "exampleCountries": {
        "India": "8-10 weeks",
        "China": "8-12 weeks",
        "Nigeria": "12-16 weeks"
      }
    }
  }
]
```

### 2. Get Program by Type/Subtype

Retrieves information about a specific program by type and subtype.

- **URL**: `/programs/details`
- **Method**: `GET`
- **Auth Required**: Yes (JWT token in header)
- **Query Parameters**: `type`, `subtype`

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request URL Example:**
```
/api/programs/details?type=Economic%20Immigration&subtype=Express%20Entry
```

**Success Response:**
```json
{
  "id": "ee-fsw",
  "programName": "Federal Skilled Worker",
  "category": "Permanent Residence",
  "description": "Program for skilled workers with foreign work experience who want to immigrate to Canada permanently.",
  "visaOffices": "Various global visa offices",
  "milestoneUpdates": [
    "Profile Created",
    "ITA Received",
    "AOR",
    "Biometrics Completed",
    "Medical Passed",
    "Background Check",
    "COPR Issued"
  ],
  "processingTimes": {
    "exampleCountries": {
      "India": "6-8 months",
      "Philippines": "6-12 months",
      "Nigeria": "8-14 months"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Program not found for the specified type and subtype"
}
```

## Error Responses

All endpoints may return the following error responses:

### Authentication Error
```json
{
  "success": false,
  "message": "Authentication required. Please login."
}
```

### Authorization Error
```json
{
  "success": false,
  "message": "Not authorized to perform this action"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Details of the error (in development environment only)"
}
```

## Pagination Support

Most list endpoints support pagination through query parameters:

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 10)

**Example Request:**
```
GET /api/applications?page=2&limit=5
```

**Example Paginated Response:**
```json
{
  "data": [
    // Array of items
  ],
  "pagination": {
    "totalItems": 23,
    "totalPages": 5,
    "currentPage": 2,
    "itemsPerPage": 5,
    "hasNextPage": true,
    "hasPreviousPage": true
  }
}
```

## Integration Considerations

1. **Authentication Flow**: Store JWT token securely and include in all authenticated requests
2. **Error Handling**: Implement robust error handling for all API responses
3. **Rate Limiting**: The API implements rate limiting; handle 429 responses appropriately
4. **Caching**: Consider using appropriate caching strategies for program and milestone data
5. **Webhook Support**: Future versions will include webhook support for real-time updates

This documentation provides a foundation for integrating with the ImmiTracker API and can be expanded as new features are developed. 