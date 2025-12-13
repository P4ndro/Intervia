/**
 * Backend API Sanity Check Script
 * Run with: node test-api.js
 */

const API_BASE = 'http://localhost:3000/api';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

let companyToken = null;
let candidateToken = null;
let companyId = null;
let candidateId = null;
let jobId = null;
let interviewId = null;

// Helper function to make API calls
async function apiCall(method, endpoint, body = null, token = null) {
  const url = `${API_BASE}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.text();
    let jsonData = {};
    
    try {
      jsonData = data ? JSON.parse(data) : {};
    } catch (e) {
      jsonData = { raw: data };
    }

    return {
      ok: response.ok,
      status: response.status,
      data: jsonData,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error.message,
    };
  }
}

// Test runner
async function test(name, fn) {
  try {
    console.log(`\n${colors.blue}Testing: ${name}${colors.reset}`);
    const result = await fn();
    if (result.ok) {
      console.log(`${colors.green}✓ PASS${colors.reset} (Status: ${result.status})`);
      if (result.data && Object.keys(result.data).length > 0) {
        console.log(`  Response:`, JSON.stringify(result.data, null, 2).substring(0, 200) + '...');
      }
      return result;
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} (Status: ${result.status})`);
      console.log(`  Error:`, result.data?.error || result.error || 'Unknown error');
      return null;
    }
  } catch (error) {
    console.log(`${colors.red}✗ ERROR${colors.reset}`);
    console.log(`  ${error.message}`);
    return null;
  }
}

// Main test suite
async function runTests() {
  console.log(`${colors.yellow}=== Backend API Sanity Check ===${colors.reset}\n`);

  // 1. Register Company
  const companyReg = await test('Register Company', async () => {
    return await apiCall('POST', '/auth/register', {
      email: `test-company-${Date.now()}@example.com`,
      password: 'password123',
      role: 'company',
      companyName: 'Test Tech Corp',
    });
  });

  if (companyReg?.data?.accessToken) {
    companyToken = companyReg.data.accessToken;
    companyId = companyReg.data.user?.id;
    console.log(`  ${colors.green}Company Token: ${companyToken.substring(0, 20)}...${colors.reset}`);
  }

  // 2. Register Candidate
  const candidateReg = await test('Register Candidate', async () => {
    return await apiCall('POST', '/auth/register', {
      email: `test-candidate-${Date.now()}@example.com`,
      password: 'password123',
      role: 'candidate',
    });
  });

  if (candidateReg?.data?.accessToken) {
    candidateToken = candidateReg.data.accessToken;
    candidateId = candidateReg.data.user?.id;
    console.log(`  ${colors.green}Candidate Token: ${candidateToken.substring(0, 20)}...${colors.reset}`);
  }

  if (!companyToken || !candidateToken) {
    console.log(`${colors.red}\n✗ Cannot continue - registration failed${colors.reset}`);
    return;
  }

  // 3. Get Company Profile
  await test('Get Company Profile (me)', async () => {
    return await apiCall('GET', '/auth/me', null, companyToken);
  });

  // 4. Create Job (Company)
  const createJob = await test('Create Job (Company)', async () => {
    return await apiCall('POST', '/jobs', {
      title: 'Senior Software Engineer',
      level: 'Senior',
      description: 'We are looking for an experienced software engineer...',
      location: 'Remote',
      employmentType: 'Full-time',
    }, companyToken);
  });

  if (createJob?.data?.job?._id) {
    jobId = createJob.data.job._id;
    console.log(`  ${colors.green}Job ID: ${jobId}${colors.reset}`);
  }

  // 5. Get Company's Jobs
  await test('Get Company\'s Own Jobs', async () => {
    return await apiCall('GET', '/jobs/company/my-jobs', null, companyToken);
  });

  // 6. Get All Jobs (Public)
  await test('Get All Active Jobs (Public)', async () => {
    return await apiCall('GET', '/jobs', null, candidateToken);
  });

  // 7. Get Specific Job
  if (jobId) {
    await test('Get Specific Job', async () => {
      return await apiCall('GET', `/jobs/${jobId}`, null, candidateToken);
    });
  }

  // 8. Update Job (Company)
  if (jobId) {
    await test('Update Job (Company)', async () => {
      return await apiCall('PATCH', `/jobs/${jobId}`, {
        title: 'Updated Senior Software Engineer',
        status: 'active',
      }, companyToken);
    });
  }

  // 9. Start Practice Interview (Candidate)
  const practiceInterview = await test('Start Practice Interview (Candidate)', async () => {
    return await apiCall('POST', '/interviews/start', null, candidateToken);
  });

  if (practiceInterview?.data?.interviewId) {
    interviewId = practiceInterview.data.interviewId;
    console.log(`  ${colors.green}Practice Interview ID: ${interviewId}${colors.reset}`);
  }

  // 10. Apply to Job (Candidate)
  if (jobId) {
    const applyJob = await test('Apply to Job (Candidate)', async () => {
      return await apiCall('POST', `/interviews/apply/${jobId}`, null, candidateToken);
    });

    if (applyJob?.data?.interviewId) {
      interviewId = applyJob.data.interviewId;
      console.log(`  ${colors.green}Application Interview ID: ${interviewId}${colors.reset}`);
    }
  }

  // 11. Submit Answer
  if (interviewId) {
    await test('Submit Answer', async () => {
      return await apiCall('POST', `/interviews/${interviewId}/answer`, {
        questionId: 'q1',
        transcript: 'This is my test answer for the interview question.',
        skipped: false,
      }, candidateToken);
    });
  }

  // 12. Complete Interview
  if (interviewId) {
    await test('Complete Interview', async () => {
      return await apiCall('POST', `/interviews/${interviewId}/complete`, null, candidateToken);
    });
  }

  // 13. Get Interview Report
  if (interviewId) {
    await test('Get Interview Report', async () => {
      return await apiCall('GET', `/interviews/${interviewId}/report`, null, candidateToken);
    });
  }

  // 14. Get Applicants for Job (Company)
  if (jobId) {
    await test('Get Applicants for Job (Company)', async () => {
      return await apiCall('GET', `/jobs/${jobId}/applicants`, null, companyToken);
    });
  }

  // 15. Get User Stats (Company)
  await test('Get Company Stats', async () => {
    return await apiCall('GET', '/users/me/stats', null, companyToken);
  });

  // 16. Get User Stats (Candidate)
  await test('Get Candidate Stats', async () => {
    return await apiCall('GET', '/users/me/stats', null, candidateToken);
  });

  // 17. Try to access company endpoint as candidate (should fail)
  await test('Candidate accessing company endpoint (should fail)', async () => {
    const result = await apiCall('GET', '/jobs/company/my-jobs', null, candidateToken);
    // This should fail, so we check for 403
    return {
      ok: result.status === 403,
      status: result.status,
      data: result.data,
    };
  });

  // 18. Try to create job as candidate (should fail)
  await test('Candidate creating job (should fail)', async () => {
    const result = await apiCall('POST', '/jobs', {
      title: 'Test Job',
      level: 'Junior',
      description: 'Test',
    }, candidateToken);
    // This should fail, so we check for 403
    return {
      ok: result.status === 403,
      status: result.status,
      data: result.data,
    };
  });

  // 19. Delete Job (Company)
  if (jobId) {
    await test('Delete Job (Company)', async () => {
      return await apiCall('DELETE', `/jobs/${jobId}`, null, companyToken);
    });
  }

  console.log(`\n${colors.yellow}=== Tests Complete ===${colors.reset}\n`);
}

// Run tests
runTests().catch(console.error);

