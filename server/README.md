# Backend API - Ready for Frontend Integration

## ✅ What's Complete

### Authentication & Authorization
- ✅ User registration (candidate & company)
- ✅ User login with JWT tokens
- ✅ Role-based access control (candidate/company)
- ✅ Token refresh mechanism
- ✅ Protected routes with `requireAuth` middleware
- ✅ Company-only routes with `requireCompany` middleware

### Company Features
- ✅ Company registration with company name
- ✅ Create jobs (title, level, description, location, employmentType)
- ✅ View own jobs
- ✅ Update jobs
- ✅ Delete jobs
- ✅ View applicants/reports for each job
- ✅ Company stats endpoint

### Candidate Features
- ✅ Candidate registration
- ✅ Browse all active jobs
- ✅ Start practice interviews
- ✅ Apply to company jobs
- ✅ Submit interview answers
- ✅ Complete interviews
- ✅ View interview reports
- ✅ Candidate stats endpoint

### Data Models
- ✅ User model (with role & companyName)
- ✅ Job model (linked to company)
- ✅ Interview model (linked to job & company)

## 📁 File Structure

```
server/
├── models/
│   ├── User.js          # User schema with roles
│   ├── Job.js           # Job schema
│   └── Interview.js     # Interview schema
├── routes/
│   ├── auth.js          # Authentication endpoints
│   ├── jobs.js          # Job CRUD + applicants
│   ├── interviews.js    # Interview management
│   └── users.js         # User stats
├── middleware/
│   ├── auth.js          # requireAuth middleware
│   └── company.js       # requireCompany middleware
├── config/
│   └── db.js            # MongoDB connection
├── index.js              # Express app setup
├── test-api.js          # Automated test script
├── API_ENDPOINTS.md     # Complete API documentation
├── TEST_GUIDE.md        # Testing instructions
└── README.md            # This file
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables (.env):**
   ```
   MONGODB_URL=your_mongodb_connection_string
   JWT_ACCESS_SECRET=your_secret_key
   JWT_REFRESH_SECRET=your_refresh_secret
   PORT=3000
   CLIENT_ORIGIN=http://localhost:5173
   ```

3. **Run server:**
   ```bash
   npm run dev
   ```

4. **Test API:**
   ```bash
   npm test
   ```

## 📡 API Base URL

```
http://localhost:3000/api
```

## 🔑 Key Endpoints for Frontend

### Authentication
- `POST /api/auth/register` - Register (candidate or company)
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

### Jobs (Company)
- `GET /api/jobs/company/my-jobs` - Get company's jobs
- `POST /api/jobs` - Create job
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/:id/applicants` - View applicants

### Jobs (Public)
- `GET /api/jobs` - Browse all active jobs

### Interviews
- `POST /api/interviews/start` - Start practice interview
- `POST /api/interviews/apply/:jobId` - Apply to job
- `POST /api/interviews/:id/answer` - Submit answer
- `POST /api/interviews/:id/complete` - Complete interview
- `GET /api/interviews/:id/report` - Get report

### Stats
- `GET /api/users/me/stats` - Get user stats (role-based)

## 🔒 Security

- ✅ JWT token authentication
- ✅ HttpOnly refresh tokens
- ✅ Role-based access control
- ✅ Companies can only access their own jobs
- ✅ Candidates cannot access company endpoints

## 📝 Frontend Integration Notes

1. **Registration:**
   - Send `role: 'company'` and `companyName` for company registration
   - Send `role: 'candidate'` (or omit) for candidate registration

2. **Token Management:**
   - Store access token in memory (not localStorage)
   - Refresh token is automatically sent via HttpOnly cookie
   - Include `Authorization: Bearer <token>` header for protected routes

3. **Role-Based UI:**
   - Check `user.role` from `/api/auth/me` to show appropriate UI
   - Companies see: job management, applicants
   - Candidates see: job browsing, interviews, reports

## ✅ Testing

All endpoints have been tested and verified:
- ✅ Company registration & login
- ✅ Candidate registration & login
- ✅ Job CRUD operations
- ✅ Interview flow
- ✅ Security (role-based access)
- ✅ Stats endpoints

Run `npm test` to verify everything works.

## 📚 Documentation

- See `API_ENDPOINTS.md` for complete API documentation
- See `TEST_GUIDE.md` for testing instructions

---

**Status: ✅ Ready for Frontend Development**

