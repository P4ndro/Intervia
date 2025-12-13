# Backend API Testing Guide

## Option 1: Automated Test Script (Recommended)

Run the automated test script that tests all endpoints:

```bash
cd server
npm test
```

This will:
- Register a company and candidate
- Test all CRUD operations
- Test security (role-based access)
- Show pass/fail for each test

**Requirements:** Node.js 18+ (for built-in fetch)

---

## Option 2: Manual Testing with curl

### 1. Register Company
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "company@test.com",
    "password": "password123",
    "role": "company",
    "companyName": "Test Corp"
  }'
```

**Save the `accessToken` from response!**

### 2. Register Candidate
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "candidate@test.com",
    "password": "password123",
    "role": "candidate"
  }'
```

**Save the `accessToken` from response!**

### 3. Get Current User (Company)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_COMPANY_TOKEN"
```

### 4. Create Job (Company)
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Authorization: Bearer YOUR_COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Software Engineer",
    "level": "Senior",
    "description": "We are looking for an experienced engineer...",
    "location": "Remote",
    "employmentType": "Full-time"
  }'
```

**Save the `job._id` from response!**

### 5. Get Company's Jobs
```bash
curl -X GET http://localhost:3000/api/jobs/company/my-jobs \
  -H "Authorization: Bearer YOUR_COMPANY_TOKEN"
```

### 6. Get All Active Jobs (Public)
```bash
curl -X GET http://localhost:3000/api/jobs \
  -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN"
```

### 7. Update Job
```bash
curl -X PATCH http://localhost:3000/api/jobs/JOB_ID \
  -H "Authorization: Bearer YOUR_COMPANY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Title",
    "status": "active"
  }'
```

### 8. Apply to Job (Candidate)
```bash
curl -X POST http://localhost:3000/api/interviews/apply/JOB_ID \
  -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN"
```

**Save the `interviewId` from response!**

### 9. Submit Answer
```bash
curl -X POST http://localhost:3000/api/interviews/INTERVIEW_ID/answer \
  -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "questionId": "q1",
    "transcript": "This is my answer...",
    "skipped": false
  }'
```

### 10. Complete Interview
```bash
curl -X POST http://localhost:3000/api/interviews/INTERVIEW_ID/complete \
  -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN"
```

### 11. Get Interview Report
```bash
curl -X GET http://localhost:3000/api/interviews/INTERVIEW_ID/report \
  -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN"
```

### 12. Get Applicants for Job (Company)
```bash
curl -X GET http://localhost:3000/api/jobs/JOB_ID/applicants \
  -H "Authorization: Bearer YOUR_COMPANY_TOKEN"
```

### 13. Get User Stats
```bash
# Company stats
curl -X GET http://localhost:3000/api/users/me/stats \
  -H "Authorization: Bearer YOUR_COMPANY_TOKEN"

# Candidate stats
curl -X GET http://localhost:3000/api/users/me/stats \
  -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN"
```

### 14. Test Security (Should Fail)
```bash
# Candidate trying to access company endpoint (should return 403)
curl -X GET http://localhost:3000/api/jobs/company/my-jobs \
  -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN"

# Candidate trying to create job (should return 403)
curl -X POST http://localhost:3000/api/jobs \
  -H "Authorization: Bearer YOUR_CANDIDATE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "level": "Junior", "description": "Test"}'
```

### 15. Delete Job
```bash
curl -X DELETE http://localhost:3000/api/jobs/JOB_ID \
  -H "Authorization: Bearer YOUR_COMPANY_TOKEN"
```

---

## Option 3: Using Postman/Thunder Client

1. **Import Collection:**
   - Create a new collection
   - Add all endpoints from `API_ENDPOINTS.md`
   - Set base URL: `http://localhost:3000/api`

2. **Set Variables:**
   - `baseUrl`: `http://localhost:3000/api`
   - `companyToken`: (set after registering company)
   - `candidateToken`: (set after registering candidate)
   - `jobId`: (set after creating job)
   - `interviewId`: (set after applying to job)

3. **Test Flow:**
   - Register Company → Save token
   - Register Candidate → Save token
   - Create Job → Save jobId
   - Apply to Job → Save interviewId
   - Complete Interview
   - View Applicants

---

## Option 4: Using Browser Console (Quick Test)

Open browser console on any page and run:

```javascript
// Register Company
fetch('http://localhost:3000/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@company.com',
    password: 'password123',
    role: 'company',
    companyName: 'Test Corp'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Company Token:', data.accessToken);
  window.companyToken = data.accessToken;
});

// Then use the token:
fetch('http://localhost:3000/api/jobs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${window.companyToken}`
  },
  body: JSON.stringify({
    title: 'Test Job',
    level: 'Senior',
    description: 'Test description'
  })
})
.then(r => r.json())
.then(console.log);
```

---

## Quick Health Check

```bash
curl http://localhost:3000/api/health
```

Should return: `{"status":"ok","timestamp":"..."}`

