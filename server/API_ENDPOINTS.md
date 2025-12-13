# Company Backend API Endpoints

## Authentication

### Register Company
```
POST /api/auth/register
Body: {
  "email": "company@example.com",
  "password": "password123",
  "role": "company",
  "companyName": "Tech Corp"
}
Response: {
  "accessToken": "...",
  "user": {
    "id": "...",
    "email": "company@example.com",
    "role": "company",
    "companyName": "Tech Corp"
  }
}
```

### Register Candidate
```
POST /api/auth/register
Body: {
  "email": "candidate@example.com",
  "password": "password123",
  "role": "candidate"  // optional, defaults to candidate
}
```

### Login
```
POST /api/auth/login
Body: {
  "email": "...",
  "password": "..."
}
Response: {
  "accessToken": "...",
  "user": {
    "id": "...",
    "email": "...",
    "role": "company" | "candidate",
    "companyName": "..." // only for companies
  }
}
```

### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: {
  "user": {
    "id": "...",
    "email": "...",
    "role": "company" | "candidate",
    "companyName": "..." // only for companies
  }
}
```

## Jobs (Company Management)

### Get All Active Jobs (for candidates)
```
GET /api/jobs
Headers: Authorization: Bearer <token>
Response: {
  "jobs": [
    {
      "id": "...",
      "title": "Software Engineer",
      "company": "Tech Corp",
      "level": "Senior",
      "location": "Remote",
      "type": "Full-time",
      "description": "...",
      "posted": "2 days ago"
    }
  ]
}
```

### Get Company's Own Jobs
```
GET /api/jobs/company/my-jobs
Headers: Authorization: Bearer <company_token>
Response: {
  "jobs": [
    {
      "_id": "...",
      "title": "Software Engineer",
      "level": "Senior",
      "description": "...",
      "location": "Remote",
      "employmentType": "Full-time",
      "status": "active",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### Create Job (Company Only)
```
POST /api/jobs
Headers: Authorization: Bearer <company_token>
Body: {
  "title": "Software Engineer",
  "level": "Senior",  // "Junior" | "Mid" | "Senior"
  "description": "We are looking for...",
  "location": "Remote",  // optional, defaults to "Remote"
  "employmentType": "Full-time"  // optional, defaults to "Full-time"
}
Response: {
  "job": {
    "id": "...",
    "title": "...",
    "level": "...",
    "description": "...",
    "location": "...",
    "employmentType": "...",
    "status": "active",
    "createdAt": "..."
  }
}
```

### Update Job (Company Only, Own Jobs)
```
PATCH /api/jobs/:id
Headers: Authorization: Bearer <company_token>
Body: {
  "title": "Updated Title",  // optional
  "level": "Mid",  // optional
  "description": "...",  // optional
  "location": "...",  // optional
  "employmentType": "...",  // optional
  "status": "closed"  // optional: "draft" | "active" | "closed"
}
Response: {
  "job": { ... }
}
```

### Delete Job (Company Only, Own Jobs)
```
DELETE /api/jobs/:id
Headers: Authorization: Bearer <company_token>
Response: {
  "message": "Job deleted successfully"
}
```

### Get Applicants for a Job (Company Only)
```
GET /api/jobs/:id/applicants
Headers: Authorization: Bearer <company_token>
Response: {
  "job": {
    "id": "...",
    "title": "Software Engineer",
    "level": "Senior"
  },
  "applicants": [
    {
      "interviewId": "...",
      "candidateEmail": "candidate@example.com",
      "overallScore": 85,
      "technicalScore": 90,
      "behavioralScore": 80,
      "primaryBlockers": [...],
      "strengths": [...],
      "areasForImprovement": [...],
      "completedAt": "...",
      "createdAt": "..."
    }
  ],
  "totalApplicants": 5
}
```

## Interviews

### Start Practice Interview (Candidate Only)
```
POST /api/interviews/start
Headers: Authorization: Bearer <candidate_token>
Response: {
  "interviewId": "...",
  "questions": [...],
  "currentQuestionIndex": 0,
  "totalQuestions": 3
}
```

### Apply to Job (Candidate Only)
```
POST /api/interviews/apply/:jobId
Headers: Authorization: Bearer <candidate_token>
Response: {
  "interviewId": "...",
  "jobTitle": "Software Engineer",
  "questions": [...],
  "currentQuestionIndex": 0,
  "totalQuestions": 3
}
```

### Submit Answer
```
POST /api/interviews/:id/answer
Headers: Authorization: Bearer <token>
Body: {
  "questionId": "q1",
  "transcript": "My answer...",
  "skipped": false
}
```

### Complete Interview
```
POST /api/interviews/:id/complete
Headers: Authorization: Bearer <token>
```

### Get Interview Report
```
GET /api/interviews/:id/report
Headers: Authorization: Bearer <token>
```

## User Stats

### Get User Statistics
```
GET /api/users/me/stats
Headers: Authorization: Bearer <token>
Response (Candidate): {
  "completedInterviews": 5,
  "averageScore": 78,
  "totalPracticeTime": "2h 30m"
}
Response (Company): {
  "jobsPosted": 12,
  "totalApplicants": 45,
  "interviewsCompleted": 38
}
```

