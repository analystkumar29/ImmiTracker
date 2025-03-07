const axios = require('axios');

// Base URL for API requests
const API_URL = 'http://localhost:3000/api';

// Test user credentials
const testUser = {
  email: 'test2@example.com',
  password: 'password123'
};

// Admin user credentials
const adminUser = {
  email: 'admin@example.com',
  password: 'password123'
};

// Function to log responses in a readable format
const logResponse = (title, response) => {
  console.log(`\n=== ${title} ===`);
  console.log('Status:', response.status);
  console.log('Data:', JSON.stringify(response.data, null, 2));
};

// Main testing function
async function testApi() {
  try {
    // Test authentication
    console.log('\n--- Testing Authentication ---');
    
    // Login as test user
    const loginResponse = await axios.post(`${API_URL}/auth/login`, testUser);
    logResponse('Login Response', loginResponse);
    
    // Extract token for authenticated requests
    const token = loginResponse.data.token;
    const authHeader = { Authorization: `Bearer ${token}` };
    
    // Test applications endpoints
    console.log('\n--- Testing Applications Endpoints ---');
    
    // Get all applications
    const applicationsResponse = await axios.get(`${API_URL}/applications`, { headers: authHeader });
    logResponse('Get Applications', applicationsResponse);
    
    // Create a new application
    const newApplication = {
      type: 'Study Permit',
      subType: 'University',
      country: 'Canada',
      city: 'Vancouver',
      submissionDate: new Date().toISOString()
    };
    
    const createApplicationResponse = await axios.post(`${API_URL}/applications`, newApplication, { headers: authHeader });
    logResponse('Create Application', createApplicationResponse);
    
    // Get application by ID
    const applicationId = createApplicationResponse.data.id;
    const getApplicationResponse = await axios.get(`${API_URL}/applications/${applicationId}`, { headers: authHeader });
    logResponse('Get Application by ID', getApplicationResponse);
    
    // Update application status
    const statusUpdate = {
      statusName: 'Application Received',
      statusDate: new Date().toISOString(),
      notes: 'Application received by processing center'
    };
    
    const updateStatusResponse = await axios.post(`${API_URL}/applications/${applicationId}/status`, statusUpdate, { headers: authHeader });
    logResponse('Update Application Status', updateStatusResponse);
    
    // Test programs endpoints
    console.log('\n--- Testing Programs Endpoints ---');
    
    // Get all programs
    const programsResponse = await axios.get(`${API_URL}/programs`, { headers: authHeader });
    logResponse('Get Programs', programsResponse);
    
    // Test milestones endpoints
    console.log('\n--- Testing Milestones Endpoints ---');
    
    // Get milestones for a program type
    const milestonesResponse = await axios.get(`${API_URL}/milestones/program/Study Permit`, { headers: authHeader });
    logResponse('Get Milestones by Program Type', milestonesResponse);
    
    // Get milestone templates
    const templatesResponse = await axios.get(`${API_URL}/milestones/templates/Study Permit`, { headers: authHeader });
    logResponse('Get Milestone Templates', templatesResponse);
    
    // Create a custom milestone
    const customMilestone = {
      name: 'Custom Milestone Test',
      programType: 'Study Permit',
      programSubType: 'University'
    };
    
    const createMilestoneResponse = await axios.post(`${API_URL}/milestones/custom`, customMilestone, { headers: authHeader });
    logResponse('Create Custom Milestone', createMilestoneResponse);
    
    // Test admin endpoints with admin user
    console.log('\n--- Testing Admin Endpoints ---');
    
    // Login as admin
    const adminLoginResponse = await axios.post(`${API_URL}/auth/login`, adminUser);
    const adminToken = adminLoginResponse.data.token;
    const adminAuthHeader = { Authorization: `Bearer ${adminToken}` };
    
    // Get popular milestones (admin only)
    try {
      const popularMilestonesResponse = await axios.get(`${API_URL}/milestones/popular`, { headers: adminAuthHeader });
      logResponse('Get Popular Milestones (Admin)', popularMilestonesResponse);
    } catch (error) {
      console.error('Admin endpoint test failed:', error.message);
    }
    
    console.log('\n--- API Testing Completed Successfully ---');
  } catch (error) {
    console.error('\n--- API Testing Failed ---');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the tests
testApi(); 