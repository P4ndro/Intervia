# Intervia

An AI-powered mock interview platform that helps candidates prepare for job interviews and produces explainable interview reports.

## 🏆 Hackathon Project

**Built for:** [GDG Kutaisi HACK THE HALLS Hackathon 2025](https://gdg.community.dev/)

Intervia was developed as a hackathon project for the GDG Kutaisi HACK THE HALLS Hackathon 2025. This project showcases a complete full-stack application with AI integration, real-time video interviewing capabilities, and comprehensive evaluation features.

### 👥 Team

- **Backend Developer** - Sandro Iobidze
- **AI Logic Developer** - Davit Jincharadze
- **Frontend Developer** - Juliet Chapidze
- **Frontend Developer** - Saba Ananidze

Practice mock interviews with an AI interviewer, get real-time feedback, and receive comprehensive reports with actionable insights.

## 🎯 Vision

Intervia is a productivity tool designed to:
- **For Candidates**: Practice realistic job interviews and receive constructive AI-powered feedback
- **For Companies** (future): Pre-screen applicants before human interviews

Current focus: **Candidate-side MVP** ✅ **COMPLETE**

---

## ✨ Features

### 🎤 Interactive Video Interview Experience
- **AI Video Interviewer**: Animated interviewer that speaks questions using browser TTS (Text-to-Speech)
- **Webcam Integration**: Record your video responses during the interview
- **Voice Input**: Speech-to-Text (STT) support for hands-free answering
- **Real-time UI**: Modern, professional interface with live video feeds

### 🤖 AI-Powered Question Generation
- **Job-Based Questions**: Generate tailored questions from job descriptions
- **Practice Mode**: Get general interview questions for any role
- **Smart Question Types**: Mix of technical, behavioral, and coding questions
- **Configurable Difficulty**: Easy, medium, or hard questions

### 📊 Intelligent Answer Evaluation
- **AI Evaluation**: Real-time analysis of answer quality, clarity, and depth
- **Weighted Scoring**: Technical questions weighted higher than behavioral
- **Detailed Feedback**: Get specific insights on strengths and areas for improvement

### 📈 Comprehensive Interview Reports
- **Overall Readiness Score**: Understand how interview-ready you are (0-100%)
- **Category Breakdown**: Separate scores for technical vs behavioral questions
- **Primary Blockers**: Identify specific questions that held you back
- **Actionable Insights**: AI-generated recommendations for improvement
- **Interview History**: Access and review all past interview reports

### 🔐 Secure Authentication
- JWT-based authentication with access and refresh tokens
- Protected routes and API endpoints
- User profile management

---

## 🚀 Core User Flow

```
Landing Page → Register/Login → Home → Start Interview → Interview Room → Report → Home
                                                ↑                              ↓
                                                └──── View Past Reports ←──────┘
```

1. User lands on the site
2. User registers or logs in (JWT auth)
3. User is redirected to Home
4. User starts a mock interview (job-based or practice mode)
5. User enters Interview Room with video interviewer
6. AI speaks questions via TTS
7. User answers via text input, voice (STT), or both
8. User submits answers (with 2-minute timer per question)
9. Interview completes automatically
10. AI generates comprehensive report
11. User sees detailed feedback with scores and recommendations
12. User returns to Home and can revisit past reports

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (access + refresh tokens) |
| AI Provider | Groq (Llama 3.3 70B) - Fast & Free |
| Speech | Web Speech API (TTS & STT) - Browser Native |
| Video | HTML5 Video + WebRTC |

---

## 📁 Project Structure

```
/
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # Landing, Auth, Home, Interview, Report, Profile
│       ├── components/     # Reusable UI components
│       ├── api.js          # API client
│       └── authContext.jsx # Auth state management
│
├── server/                 # Express backend
│   ├── ai/                 # AI services (questions, evaluation, reports)
│   │   ├── questionGenerator.js
│   │   ├── answerEvaluator.js
│   │   └── reportGenerator.js
│   ├── models/             # User, Interview, Job models
│   ├── routes/             # API routes
│   │   ├── auth.js
│   │   ├── interviews.js
│   │   └── jobs.js
│   └── middleware/         # Auth, error handling
│
└── README.md               # This file
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Groq API key (optional - can use mock mode)

### Installation

```bash
# Install root dependencies
npm install

# Install client and server dependencies
npm run install:all
```

### Environment Configuration

Create `server/.env`:
```env
# Database
MONGODB_URL=your-mongodb-connection-string

# JWT Secrets
JWT_ACCESS_SECRET=your-access-secret-key-here
JWT_REFRESH_SECRET=your-refresh-secret-key-here

# Server
CLIENT_ORIGIN=http://localhost:5173
PORT=3000

# AI Configuration
GROQ_API_KEY=your-groq-api-key-here
USE_MOCK_AI=false

# Optional: Use mock AI if you don't have a Groq API key
# USE_MOCK_AI=true
```

Create `client/.env`:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Running the Application

```bash
# Run both client and server in development mode
npm run dev

# Or run separately:
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

Open http://localhost:5173

---

## 🎯 Interview Evaluation Philosophy

### Weighted Scoring
- **Technical/coding questions** → Higher weight (2x)
- **Behavioral questions** → Standard weight (1x)

### Report Language
The AI acts as a **coach**, not a hiring authority:
- ✅ "What held your readiness back..."  
- ✅ "Your technical understanding shows strength in..."
- ❌ "You failed..." or "Rejected"

### Primary Blockers
Reports identify specific questions that most negatively affected readiness, with constructive guidance on how to improve.

---

## 🤖 AI Integration

The project uses **Groq** (Llama 3.3 70B) for fast, free AI inference:

### AI Services

1. **Question Generation** (`server/ai/questionGenerator.js`)
   - Generates tailored questions from job descriptions
   - Practice mode for general interview prep
   - Supports technical, behavioral, and coding questions

2. **Answer Evaluation** (`server/ai/answerEvaluator.js`)
   - Analyzes answer quality, relevance, clarity, and depth
   - Provides detailed feedback per answer
   - Detects strengths and areas for improvement

3. **Report Generation** (`server/ai/reportGenerator.js`)
   - Generates comprehensive interview reports
   - Calculates weighted readiness scores
   - Identifies primary blockers and provides actionable insights

### Mock Mode
If you don't have a Groq API key, set `USE_MOCK_AI=true` in `.env` to use deterministic mock responses for testing.

### Getting a Groq API Key
1. Visit https://console.groq.com
2. Sign up for a free account
3. Generate an API key
4. Add it to `server/.env` as `GROQ_API_KEY`

---

## 🎤 Video & Speech Features

### Text-to-Speech (TTS)
- Browser-native Web Speech API (100% free)
- AI interviewer speaks questions aloud
- Animated video changes based on speaking state
- Voice selection (prefers male voice for interviewer)

### Speech-to-Text (STT)
- Browser-native Web Speech API (100% free)
- Voice input for hands-free answering
- Real-time transcription
- Works in Chrome/Edge (best support)

### Video Features
- Webcam integration with enable/disable toggle
- AI interviewer video (idle and speaking states)
- Split-screen layout (interviewer | candidate)
- Professional interview room aesthetic

---

## 📊 Database Models

### Users
```javascript
{
  email: String (unique),
  passwordHash: String,
  role: 'candidate' | 'company',
  createdAt: Date
}
```

### Interviews
```javascript
{
  userId: ObjectId,
  jobId: ObjectId (optional),
  status: 'in_progress' | 'completed',
  interviewType: 'practice' | 'application',
  questions: [{
    id: String,
    text: String,
    type: 'technical' | 'behavioral',
    category: String,
    difficulty: 'easy' | 'medium' | 'hard',
    weight: Number
  }],
  answers: [{
    questionId: String,
    transcript: String,
    skipped: Boolean,
    aiEvaluation: {
      relevanceScore: Number,
      clarityScore: Number,
      depthScore: Number,
      feedback: String,
      strengths: [String],
      detectedIssues: [String]
    }
  }],
  evaluation: {
    overallReadiness: Number,
    technicalReadiness: Number,
    behavioralReadiness: Number,
    primaryBlockers: [Object]
  },
  report: {
    summary: String,
    recommendations: [String],
    strengths: [String]
  },
  createdAt: Date,
  completedAt: Date
}
```

### Jobs
```javascript
{
  title: String,
  company: String,
  description: String,
  requirements: [String],
  companyId: ObjectId
}
```

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| POST | `/api/auth/refresh` | Refresh access token |
| GET | `/api/auth/me` | Get current user |

### Interviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interviews` | Start new interview |
| GET | `/api/interviews` | List user's interviews |
| GET | `/api/interviews/:id` | Get interview details |
| POST | `/api/interviews/:id/answer` | Submit answer to question |
| POST | `/api/interviews/:id/complete` | Complete interview |
| GET | `/api/interviews/:id/report` | Get interview report |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/jobs` | Create job posting (company) |
| GET | `/api/jobs` | List jobs |
| GET | `/api/jobs/:id` | Get job details |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

---

## ✅ MVP Success Criteria

- [x] User can register/login
- [x] User can start an interview (job-based or practice)
- [x] User can answer multiple questions
- [x] AI generates questions dynamically
- [x] AI evaluates answers in real-time
- [x] User can see a comprehensive report
- [x] User can return to Home and revisit past reports
- [x] All data persists after page refresh
- [x] Video interviewer with TTS
- [x] Speech-to-Text support
- [x] Webcam integration
- [x] Timer-based question answering
- [x] Weighted scoring system

**Status: MVP Complete! 🎉**

---

## 🏗 Architecture Principles

| Principle | Implementation |
|-----------|----------------|
| Backend owns logic | All business logic lives in the API |
| Frontend is presentational | React only renders UI and calls endpoints |
| Stateless backend | No server-side sessions (except DB) |
| REST API | No GraphQL, no real-time features (yet) |
| Minimal components | Avoid over-splitting React components |
| AI abstraction | Easy to swap AI providers |

---

## 📝 Development Status

| Phase | Status |
|-------|--------|
| Auth scaffold | ✅ Complete |
| Frontend pages | ✅ Complete |
| API endpoints | ✅ Complete |
| Interview flow | ✅ Complete |
| AI integration | ✅ Complete (Groq) |
| Question generation | ✅ Complete |
| Answer evaluation | ✅ Complete |
| Report generation | ✅ Complete |
| Video interviewer | ✅ Complete |
| Speech features | ✅ Complete |
| Company features | ⏳ Future |

---

## 🔧 Development Scripts

```bash
# Install all dependencies
npm run install:all

# Run both client and server
npm run dev

# Build for production
cd client && npm run build
cd server && npm start
```

---

## 📚 Additional Documentation

- `server/AI_README.md` - Detailed AI integration guide

---
Backend Developer - Sandro Iobidze
AI logic Developer - Davit Jincharadze
Frontend Developer - Juliet Chapidze
Frontend Developer - Saba Ananidze
