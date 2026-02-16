<div align="center">

# 🎮 IFA SkillQuest

### Gamified Cognitive Assessment Platform for Modern Hiring

[![MongoDB](https://img.shields.io/badge/MongoDB-5.0+-47A248?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)](LICENSE)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com)

[🚀 Live Demo](#demo) • [📖 Documentation](#documentation) • [🎯 Features](#features) • [⚡ Quick Start](#quick-start)

<!-- 🖼️ Banner Image Placeholder: Add your project screenshot here -->

</div>

---

## 🌟 Overview

**IFA SkillQuest** is a next-generation hiring assessment platform that transforms traditional candidate evaluation through gamified cognitive testing. Our platform delivers sequential, timed challenges that measure risk assessment, spatial reasoning, logical sequencing, and domain knowledge—providing recruiters with actionable insights into candidate capabilities.

Built with modern web technologies and deployed on Vercel, SkillQuest offers role-based dashboards, real-time leaderboards, and comprehensive analytics while maintaining an engaging user experience through anti-cheating mechanisms and progressive game unlocking.

### Why This Platform?

| Feature | Description |
|---------|-------------|
| 🎯 **Science-Backed Assessments** | Games designed to measure specific cognitive skills (risk assessment, planning, optimization) |
| 🔓 **Progressive Unlocking** | Sequential gating ensures candidates complete challenges in order, preventing cherry-picking |
| ⏱️ **Timed Challenges** | 5-minute windows per game create standardized evaluation conditions |
| 📊 **Rich Analytics** | Detailed metrics including completion rate, error tracking, move optimization, and time analysis |
| 🏆 **Instant Leaderboards** | Real-time ranking with tie-breaker logic and sortable columns |
| 🛡️ **Anti-Cheating Measures** | Tab-switch detection with 3-strike disqualification and submission locking |
| 👥 **Multi-Role System** | Separate workflows for applicants (assessment) and admins (analytics) |
| 🚀 **Production Ready** | Serverless deployment, MongoDB Atlas cloud database, OAuth authentication |

---

## ⚡ Quick Start

```bash
# Clone repository
git clone https://github.com/yourusername/skillquest-platform.git
cd skillquest-platform

# Backend setup
cd backend
npm install
echo "MONGODB_URI=your_mongodb_uri\nPORT=5000" > .env
npm run dev

# Frontend setup (new terminal)
cd ../frontend
npm install
echo "VITE_API_URL=http://localhost:5000/api\nVITE_GOOGLE_CLIENT_ID=your_client_id" > .env
npm run dev
```

📘 For detailed setup instructions, see [Installation Guide](#installation) and [Environment Variables](#environment-variables)

---

## 🎬 Demo

<!-- 🌐 Live Demo: [https://skillquest-demo.vercel.app](https://skillquest-demo.vercel.app) -->

<details>
<summary>📸 Screenshots (Click to expand)</summary>

<!-- Add screenshots here
![Dashboard](docs/screenshots/dashboard.png)
![Game Interface](docs/screenshots/game.png)
![Admin Panel](docs/screenshots/admin.png)
-->

**Screenshots coming soon!** Add images to `docs/screenshots/` folder.

</details>

---

## 📑 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Testing](#testing)
- [Documentation](#documentation)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Support](#support)

---

## 🎯 Features

<table>
<tr>
<td width="50%" valign="top">

### 🎮 **Gamified Assessment Suite**
- **Minesweeper** - Risk assessment & deductive logic
  - Progressive difficulty levels
  - Mine hit tracking
  - Flood-fill algorithm
- **Unblock Me** - Spatial reasoning & planning
  - 6x6 sliding block puzzles
  - Move optimization tracking
  - Progressive complexity
- **Water Capacity** - Logical sequencing
  - Classic liquid transfer puzzles
  - Step optimization metrics
  - Visual feedback system
- **Quiz Module** - Domain knowledge testing
  - Image-based questions support
  - Randomized question ordering
  - Instant scoring

### 🔐 **Authentication & Roles**
- Google OAuth 2.0 integration
- JWT-based session management
- Multi-role support:
  - 👤 **Applicant** - Take assessments, view scores
  - 👑 **Admin** - Manage candidates, view analytics
  - 🔒 **Employee/Client** - Placeholder (future)
- Secure route protection

### 📊 **Admin Dashboard**
- Real-time candidate monitoring
- Comprehensive scorecards
- Filterable/searchable data tables
- Individual game performance drill-down
- Bulk operations support
- Export capabilities

</td>
<td width="50%" valign="top">

### 🏆 **Scoring & Leaderboard**
- Weighted scoring algorithm:
  - Minesweeper: `score × 5`
  - Unblock Me: `score × 6`
  - Water Capacity: `score × 3`
  - Quiz: `score × 10`
- Multi-criteria tie-breaker logic
- Sortable by score, time, college
- Medal indicators for top performers
- Completion timestamp tracking

### 🛡️ **Anti-Cheating Mechanisms**
- Tab switch detection
- 3-strike disqualification system
- One-time assessment submission
- Sequential game unlocking
- Server-side score validation
- Timestamp verification

### 🔓 **Progressive Unlocking System**
- **Game Sequence:**
  1. Minesweeper (unlocked by default)
  2. Unblock Me (unlocks after Minesweeper)
  3. Water Capacity (unlocks after Unblock Me)
- Trial mode available post-completion
- Visual lock indicators
- Completion tracking

### 📈 **Analytics & Insights**
- Completion rates per game
- Average scores and time analysis
- Error rate tracking
- Move/step optimization metrics
- College-wise performance comparison
- Location-based filtering

</td>
</tr>
</table>

---

## 🛠️ Tech Stack

<div align="center">

### Frontend
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

### Backend
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.1-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-8.19-880000?style=for-the-badge&logo=mongoose&logoColor=white)

### Authentication & APIs
![Google OAuth](https://img.shields.io/badge/Google%20OAuth-2.0-4285F4?style=for-the-badge&logo=google&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-9.0-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?style=for-the-badge&logo=openai&logoColor=white)

### Deployment & Tools
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)

</div>

<details>
<summary><b>📦 Complete Technology Breakdown</b></summary>

### Backend Dependencies
| Package | Purpose |
|---------|---------|
| `express` | Web application framework |
| `mongoose` | MongoDB ODM |
| `cors` | Cross-origin resource sharing |
| `dotenv` | Environment variable management |
| `jsonwebtoken` | JWT authentication |
| `express-rate-limit` | API rate limiting |
| `multer` | File upload handling |
| `openai` | AI integration |
| `xlsx` | Excel file parsing |
| `pdf-parse` | PDF document parsing |
| `mammoth` | DOCX file parsing |

### Frontend Dependencies
| Package | Purpose |
|---------|---------|
| `react` | UI library |
| `react-router-dom` | Client-side routing |
| `@react-oauth/google` | Google authentication |
| `framer-motion` | Animation library |
| `lucide-react` | Icon library |
| `sonner` | Toast notifications |
| `fuse.js` | Fuzzy search |
| `date-fns` | Date manipulation |
| `class-variance-authority` | Variant management |
| `tailwind-merge` | Tailwind class merging |

### DevOps & Development
| Tool | Purpose |
|------|---------|
| Vite | Build tool & dev server |
| ESLint | Code linting |
| TypeScript | Type safety |
| PostCSS | CSS processing |
| Vercel CLI | Deployment |

</details>

---

## 🏗️ Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[React SPA] --> B[Auth Context]
        A --> C[Game Engines]
        A --> D[Admin Dashboard]
    end
    
    subgraph "API Layer"
        E[Express Server] --> F[CORS Middleware]
        E --> G[Rate Limiter]
        E --> H[Error Handler]
    end
    
    subgraph "Business Logic"
        I[Authentication Controller]
        J[Assessment Controller]
        K[Leaderboard Controller]
        L[Profile Controller]
    end
    
    subgraph "Data Layer"
        M[(MongoDB Atlas)]
        N[User Collection]
        O[Profile Collection]
        P[Assessment Collection]
    end
    
    A -->|REST API| E
    F --> I
    F --> J
    F --> K
    F --> L
    I --> M
    J --> M
    K --> M
    L --> M
    M --> N
    M --> O
    M --> P
    
    style A fill:#61DAFB
    style E fill:#339933
    style M fill:#47A248
```

### Design Patterns

| Pattern | Implementation | Benefit |
|---------|---------------|---------|
| **MVC** | Controllers handle business logic, Models define schemas, Views (React) render UI | Clear separation of concerns |
| **Repository** | Mongoose models abstract database operations | Database-agnostic business logic |
| **Middleware Chain** | CORS → Rate Limit → Auth → Routes → Error Handler | Modular request processing |
| **Context API** | AuthContext manages global user state | Avoid prop drilling |
| **HOC Pattern** | Route protection with authentication wrappers | Reusable auth logic |
| **Serverless** | Stateless API handlers compatible with Vercel | Horizontal scalability |

---

## 📥 Installation

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **MongoDB Atlas Account** ([Sign up](https://www.mongodb.com/cloud/atlas))
- **Google OAuth Credentials** ([Console](https://console.cloud.google.com/))
- **Git** ([Download](https://git-scm.com/))

---

### 1️⃣ Clone Repository

```bash
git clone https://github.com/yourusername/skillquest-platform.git
cd skillquest-platform
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ifahiring
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev
```

Backend running at `http://localhost:5000` ✅

---

### 3️⃣ Frontend Setup

```bash
cd ../frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Start frontend:
```bash
npm run dev
```

Frontend running at `http://localhost:5173` ✅

---

<details>
<summary><b>🐳 Docker Setup (Optional)</b></summary>

```bash
# Build images
docker-compose build

# Start containers
docker-compose up -d

# Stop containers
docker-compose down
```

**docker-compose.yml** coming soon!

</details>

---

<details>
<summary><b>📋 Detailed Setup Instructions</b></summary>

### MongoDB Atlas Configuration

1. Create cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Add IP whitelist: `0.0.0.0/0` (for development)
3. Create database user with read/write permissions
4. Copy connection string to `MONGODB_URI`

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project → Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs:
   - `http://localhost:5173`
   - `https://your-frontend-domain.vercel.app`
5. Copy Client ID to `.env` files

### Verify Installation

```bash
# Backend health check
curl http://localhost:5000/api/health

# Expected response: {"status":"ok"}
```

</details>

---

<details>
<summary><b>⚠️ Common Issues & Fixes</b></summary>

| Issue | Solution |
|-------|----------|
| **Port already in use** | Change `PORT` in backend `.env` or kill process: `lsof -ti:5000 \| xargs kill` |
| **MongoDB connection failed** | Verify whitelist IPs and connection string format |
| **OAuth error** | Ensure redirect URIs match exactly (including http vs https) |
| **CORS errors** | Check `FRONTEND_URL` in backend `.env` matches frontend URL |
| **Module not found** | Delete `node_modules` and `package-lock.json`, run `npm install` again |

See [docs/SETUP.md](docs/SETUP.md) for comprehensive troubleshooting.

</details>

---

## 🎮 Usage

### User Workflow

```mermaid
flowchart LR
    A[Visit Platform] --> B{Select Role}
    B -->|Applicant| C[Google OAuth Login]
    B -->|Admin| D[Google OAuth Login]
    C --> E[Complete Profile]
    E --> F[Start Minesweeper]
    F --> G{Completed?}
    G -->|Yes| H[Unlock Unblock Me]
    G -->|No| F
    H --> I[Complete Unblock Me]
    I --> J{Completed?}
    J -->|Yes| K[Unlock Water Capacity]
    J -->|No| I
    K --> L[View Scores]
    D --> M[Admin Dashboard]
    M --> N[View Leaderboard]
    M --> O[Manage Candidates]
    M --> P[Export Data]
    
    style C fill:#4285F4
    style F fill:#FF6B6B
    style H fill:#4ECDC4
    style K fill:#95E1D3
```

---

### 1️⃣ Applicant Journey

**Sign Up & Profile Creation**
1. Navigate to platform homepage
2. Click "Get Started as Applicant"
3. Authenticate with Google account
4. Complete profile form:
   - Personal details (Name, Email, Phone)
   - Academic info (College, CGPA)
   - Career preferences (Location, Interested Roles)
   - Upload resume (PDF/DOC)
   - Provide Telegram ID
5. Receive unique Candidate ID (e.g., `IFA-1738272315-A3B7`)

**Taking Assessments**
1. Access applicant dashboard showing 3 game cards
2. Start with **Minesweeper** (only unlocked game initially)
3. Read game instructions in trial mode (optional)
4. Click "Start Challenge" to begin 5-minute timed assessment
5. Complete as many levels/puzzles as possible
6. Auto-submission when timer expires
7. Next game unlocks automatically
8. Repeat for **Unblock Me** and **Water Capacity**

**View Results**
- Navigate to "My Scores" section
- See individual game scores and total assessment score
- Compare performance via leaderboard ranking

---

### 2️⃣ Admin Operations

**Candidate Management**
1. Login as Admin via Google OAuth
2. Access admin dashboard
3. View all registered candidates in filterable table
4. Search by name, college, location
5. Click candidate row for detailed scorecard
6. Export data to CSV/Excel (coming soon)

**Leaderboard Analysis**
- View real-time leaderboard sorted by total score
- Apply filters: College, Location, Completion Status
- Sort by individual game scores or total assessment
- Identify top performers with medal indicators

**System Configuration**
- Adjust scoring multipliers (requires code change)
- Manage question banks for quiz module
- Upload new game puzzles

---

### Configuration Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `GAME_DURATION` | Integer | `300` (seconds) | Time limit per game |
| `TAB_SWITCH_LIMIT` | Integer | `3` | Maximum allowed tab switches |
| `MINESWEEPER_MULTIPLIER` | Float | `5.0` | Score weight for Minesweeper |
| `UNBLOCK_ME_MULTIPLIER` | Float | `6.0` | Score weight for Unblock Me |
| `WATER_CAPACITY_MULTIPLIER` | Float | `3.0` | Score weight for Water Capacity |
| `QUIZ_MULTIPLIER` | Float | `10.0` | Score weight for Quiz |

<details>
<summary><b>⚙️ Advanced Configuration Options</b></summary>

### Game Difficulty Tuning

Edit game configuration files:
- `frontend/src/components/games/Minesweeper.tsx` (grid size, mine density)
- `frontend/src/components/games/UnblockMe.tsx` (puzzle complexity)
- `frontend/src/components/games/WaterCapacity.tsx` (jug capacity ranges)

### Rate Limiting

Configure in `backend/server.js`:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

### Database Indexing

Add indexes for performance:
```javascript
// In respective model files
candidateIdIndex: true,
emailIndex: true,
googleIdIndex: true
```

</details>

---

## 📁 Project Structure

```
skillquest-platform/
│
├── backend/                        # Node.js Express backend
│   ├── server.js                   # Main entry point, server configuration
│   ├── package.json                # Backend dependencies
│   ├── vercel.json                 # Vercel deployment config
│   │
│   ├── server/
│   │   ├── config/
│   │   │   └── db.js              # MongoDB connection logic
│   │   │
│   │   ├── controllers/           # Business logic layer
│   │   │   ├── assessmentController.js      # Score submission & retrieval
│   │   │   ├── leaderboardController.js     # Ranking & tie-breaker logic
│   │   │   ├── profileController.js         # CRUD for candidate profiles
│   │   │   ├── userController.js            # User authentication & management
│   │   │   └── settingsController.js        # Admin configuration
│   │   │
│   │   ├── middleware/
│   │   │   └── errorHandler.js    # Global error handling middleware
│   │   │
│   │   ├── models/                # Mongoose schemas
│   │   │   ├── User.js            # User accounts (auth)
│   │   │   ├── Profile.js         # Candidate profiles
│   │   │   ├── Assessment.js      # Game scores
│   │   │   ├── QuestionBank.js    # Quiz questions repository
│   │   │   ├── QuestionGame.js    # Quiz game records
│   │   │   └── Settings.js        # Application settings
│   │   │
│   │   ├── routes/                # API endpoints
│   │   │   ├── users.js           # /api/users
│   │   │   ├── profiles.js        # /api/profiles
│   │   │   ├── assessments.js     # /api/assessments
│   │   │   ├── leaderboard.js     # /api/leaderboard
│   │   │   ├── questionBank.js    # /api/question-bank
│   │   │   ├── questionGame.js    # /api/question-game
│   │   │   └── settings.js        # /api/settings
│   │   │
│   │   └── services/
│   │       └── questionGenerator.js  # AI question generation service
│   │
│   └── scripts/                   # Utility scripts
│       ├── migrateImagesToBase64.js        # Image migration
│       ├── cleanupDatabase.js              # Database maintenance
│       └── extractExcelImages.js           # Excel image extraction
│
├── frontend/                       # React + TypeScript frontend
│   ├── index.html                  # Entry HTML file
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.ts              # Vite build configuration
│   ├── tsconfig.json               # TypeScript configuration
│   ├── tailwind.config.js          # Tailwind CSS configuration
│   ├── vercel.json                 # Vercel deployment config
│   │
│   └── src/
│       ├── main.tsx                # React app entry point
│       ├── App.tsx                 # Root component with routing
│       ├── index.css               # Global styles
│       │
│       ├── components/
│       │   ├── auth/               # Authentication components
│       │   │   ├── Login.tsx
│       │   │   ├── RoleSelection.tsx
│       │   │   └── ProtectedRoute.tsx
│       │   │
│       │   ├── applicant/          # Applicant-facing components
│       │   │   ├── Dashboard.tsx
│       │   │   ├── ProfileForm.tsx
│       │   │   └── ScoreView.tsx
│       │   │
│       │   ├── admin/              # Admin dashboard components
│       │   │   ├── AdminDashboard.tsx       # Main admin view
│       │   │   ├── DashboardOverview.tsx    # Statistics overview
│       │   │   ├── CandidateInsights.tsx    # Candidate details
│       │   │   ├── QuestionBankManager.tsx  # Quiz management
│       │   │   ├── QuestionBankEdit.tsx     # Quiz editing
│       │   │   ├── QuestionBankUpload.tsx   # Bulk quiz upload
│       │   │   └── ManualQuizCreator.tsx    # Manual quiz creation
│       │   │
│       │   ├── games/              # Game engine components
│       │   │   ├── Minesweeper.tsx          # Minesweeper implementation
│       │   │   ├── UnblockMe.tsx            # Sliding block puzzle
│       │   │   ├── WaterCapacity.tsx        # Liquid transfer puzzle
│       │   │   └── QuestionGame.tsx         # Quiz game
│       │   │
│       │   └── ui/                 # Reusable UI components
│       │       ├── Button.tsx
│       │       ├── Card.tsx
│       │       ├── Modal.tsx
│       │       └── Spinner.tsx
│       │
│       ├── contexts/
│       │   └── AuthContext.tsx     # Global authentication state
│       │
│       ├── hooks/
│       │   └── useTabSwitchDetection.ts  # Anti-cheating hook
│       │
│       ├── lib/                    # Utility functions
│       │   ├── api.ts              # API client
│       │   ├── utils.ts            # Helper functions (scoring, etc.)
│       │   ├── chatbot-ai.ts       # AI chatbot integration
│       │   ├── fuzzy-search.ts     # Search utilities
│       │   └── storage.ts          # LocalStorage wrapper
│       │
│       ├── types/
│       │   └── index.ts            # TypeScript interfaces
│       │
│       └── config/
│           └── api.ts              # API configuration
│
├── docs/                           # Documentation
│   ├── DESIGN_DOCUMENT.md          # Comprehensive technical design
│   ├── PROJECT_SUMMARY.md          # Feature overview
│   ├── SETUP.md                    # Development setup guide
│   ├── SCORING_SYSTEM.md           # Detailed scoring algorithms
│   ├── GAME_UNLOCKING_FLOW.md      # Game progression logic
│   ├── VERCEL_DEPLOYMENT_GUIDE.md  # Deployment instructions
│   ├── ENV_VARIABLES_QUICK_REFERENCE.md  # Environment config
│   ├── QUESTION_BANK_GUIDE.md      # Quiz management guide
│   └── MOBILE_FULLSCREEN_FIX.md    # Mobile optimization notes
│
├── .gitignore                      # Git ignore patterns
├── LICENSE                         # MIT License
└── README.md                       # This file
```

---

## 📡 API Documentation

### Base URL
- **Development:** `http://localhost:5000/api`
- **Production:** `https://your-backend.vercel.app/api`

### Authentication
All protected endpoints require JWT token in headers:
```http
Authorization: Bearer <token>
```

---

### User Management

<table>
<tr><th>Endpoint</th><th>Method</th><th>Description</th></tr>
<tr><td><code>/users/auth/google</code></td><td>POST</td><td>Google OAuth authentication</td></tr>
<tr><td><code>/users/:id</code></td><td>GET</td><td>Get user by ID</td></tr>
<tr><td><code>/users/:id</code></td><td>PUT</td><td>Update user details</td></tr>
<tr><td><code>/users/:id</code></td><td>DELETE</td><td>Delete user account</td></tr>
</table>

### Profile Management

<table>
<tr><th>Endpoint</th><th>Method</th><th>Description</th></tr>
<tr><td><code>/profiles</code></td><td>POST</td><td>Create candidate profile</td></tr>
<tr><td><code>/profiles/:userId</code></td><td>GET</td><td>Get profile by user ID</td></tr>
<tr><td><code>/profiles/:userId</code></td><td>PUT</td><td>Update profile</td></tr>
<tr><td><code>/profiles</code></td><td>GET</td><td>List all profiles (admin)</td></tr>
</table>

### Assessment & Scoring

<table>
<tr><th>Endpoint</th><th>Method</th><th>Description</th></tr>
<tr><td><code>/assessments</code></td><td>POST</td><td>Submit game score</td></tr>
<tr><td><code>/assessments/:userId</code></td><td>GET</td><td>Get user's assessment</td></tr>
<tr><td><code>/assessments/:userId/game/:gameName</code></td><td>PUT</td><td>Update specific game score</td></tr>
</table>

### Leaderboard

<table>
<tr><th>Endpoint</th><th>Method</th><th>Description</th></tr>
<tr><td><code>/leaderboard</code></td><td>GET</td><td>Get global leaderboard</td></tr>
<tr><td><code>/leaderboard/top/:limit</code></td><td>GET</td><td>Get top N performers</td></tr>
<tr><td><code>/leaderboard/stats</code></td><td>GET</td><td>Get aggregate statistics</td></tr>
</table>

### Question Bank

<table>
<tr><th>Endpoint</th><th>Method</th><th>Description</th></tr>
<tr><td><code>/question-bank</code></td><td>POST</td><td>Create question</td></tr>
<tr><td><code>/question-bank</code></td><td>GET</td><td>List all questions</td></tr>
<tr><td><code>/question-bank/:id</code></td><td>PUT</td><td>Update question</td></tr>
<tr><td><code>/question-bank/:id</code></td><td>DELETE</td><td>Delete question</td></tr>
<tr><td><code>/question-bank/upload</code></td><td>POST</td><td>Bulk upload (Excel)</td></tr>
</table>

---

### Example Requests

<details>
<summary><b>POST /assessments - Submit Score</b></summary>

```javascript
// Request
POST /api/assessments
Content-Type: application/json
Authorization: Bearer <token>

{
  "userId": "user_12345",
  "gameName": "minesweeper",
  "score": 8,
  "timeSpent": 285,
  "metadata": {
    "levelsCompleted": 8,
    "minesHit": 2
  }
}

// Response
{
  "success": true,
  "assessment": {
    "userId": "user_12345",
    "minesweeper": { "score": 8, "timeSpent": 285 },
    "totalScore": 40,
    "updatedAt": "2026-01-30T10:30:00.000Z"
  }
}
```

</details>

<details>
<summary><b>GET /leaderboard - Fetch Rankings</b></summary>

```javascript
// Request
GET /api/leaderboard?sortBy=totalScore&order=desc&limit=10

// Response
{
  "leaderboard": [
    {
      "rank": 1,
      "candidateId": "IFA-1738272315-A3B7",
      "name": "John Doe",
      "totalScore": 245,
      "collegeName": "MIT",
      "scores": {
        "minesweeper": 12,
        "unblockMe": 9,
        "waterCapacity": 15,
        "quiz": 8
      },
      "completedAt": "2026-01-30T12:45:00.000Z"
    }
    // ... more entries
  ],
  "total": 150
}
```

</details>

---

## 🚀 Deployment

### Quick Deployment Options

- **🎯 Vercel** (Recommended) - [Detailed Guide](docs/VERCEL_DEPLOYMENT_GUIDE.md)
- **🐳 Docker** - Containerized deployment (Docker Compose config coming soon)
- **☁️ AWS/GCP** - Serverless functions or EC2/Compute Engine
- **🌐 Heroku** - Traditional platform deployment

---

### Vercel Deployment (Recommended)

**1️⃣ Backend Deployment**
```bash
cd backend
vercel --prod
```

Copy backend URL: `https://your-backend.vercel.app`

**2️⃣ Frontend Deployment**
```bash
cd frontend
vercel --prod
```

Copy frontend URL: `https://your-frontend.vercel.app`

**3️⃣ Update Environment Variables**

Backend (Vercel Dashboard):
```env
MONGODB_URI=<your-mongodb-uri>
VITE_GOOGLE_CLIENT_ID=<your-client-id>
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend.vercel.app
```

Frontend (Vercel Dashboard):
```env
VITE_API_URL=https://your-backend.vercel.app/api
VITE_GOOGLE_CLIENT_ID=<your-client-id>
```

**4️⃣ Redeploy Backend** (to apply FRONTEND_URL change)
```bash
cd backend
vercel --prod
```

**5️⃣ Update Google OAuth Console**
- Add `https://your-frontend.vercel.app` to Authorized JavaScript Origins
- Add `https://your-frontend.vercel.app` to Authorized Redirect URIs

---

### Environment Variables

<details>
<summary><b>📋 Complete Environment Variable List</b></summary>

#### Backend (.env)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `MONGODB_URI` | ✅ | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `VITE_GOOGLE_CLIENT_ID` | ✅ | Google OAuth Client ID | `123456-abc.apps.googleusercontent.com` |
| `PORT` | ❌ | Server port | `5000` |
| `NODE_ENV` | ❌ | Environment mode | `development` or `production` |
| `FRONTEND_URL` | ✅ | Frontend URL for CORS | `http://localhost:5173` |
| `JWT_SECRET` | ❌ | JWT signing secret | Auto-generated if not provided |

#### Frontend (.env)
| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ | Backend API base URL | `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | ✅ | Google OAuth Client ID | `123456-abc.apps.googleusercontent.com` |

</details>

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

### Frontend Tests

```bash
cd frontend
npm test                    # Run all tests
npm run test:ui             # UI test runner
npm run test:coverage       # Coverage report
```

### End-to-End Tests

```bash
npm run test:e2e            # Cypress E2E tests (coming soon)
```

---

## 📚 Documentation

Comprehensive guides available in [`docs/`](docs/) folder:

- **[Design Document](docs/DESIGN_DOCUMENT.md)** - Complete technical architecture and system design
- **[Project Summary](docs/PROJECT_SUMMARY.md)** - Feature overview and implementation status
- **[Setup Guide](docs/SETUP.md)** - Step-by-step development environment setup
- **[Scoring System](docs/SCORING_SYSTEM.md)** - Detailed scoring algorithms and tie-breaker logic
- **[Game Unlocking Flow](docs/GAME_UNLOCKING_FLOW.md)** - Progressive unlocking mechanism
- **[Vercel Deployment](docs/VERCEL_DEPLOYMENT_GUIDE.md)** - Production deployment instructions
- **[Environment Variables](docs/ENV_VARIABLES_QUICK_REFERENCE.md)** - Configuration reference
- **[Question Bank Guide](docs/QUESTION_BANK_GUIDE.md)** - Quiz management documentation
- **[Mobile Optimization](docs/MOBILE_FULLSCREEN_FIX.md)** - Mobile UI fixes

---

## 🗺️ Roadmap

### ✅ Completed Features

- [x] Core game engines (Minesweeper, Unblock Me, Water Capacity)
- [x] Sequential game unlocking system
- [x] Google OAuth authentication
- [x] Admin dashboard with analytics
- [x] Real-time leaderboard with tie-breaker logic
- [x] Tab-switch detection and anti-cheating
- [x] Quiz module with image support
- [x] Vercel deployment configuration
- [x] MongoDB Atlas integration
- [x] Comprehensive documentation

### 🚧 In Progress

- [ ] Advanced analytics dashboard with charts
- [ ] Email notification system
- [ ] CSV/Excel export functionality
- [ ] Docker containerization
- [ ] Automated testing suite (unit + E2E)
- [ ] Performance optimization (lazy loading, caching)

### 📅 Planned Features

- [ ] **AI-Powered Features**
  - AI-generated quiz questions
  - Adaptive difficulty adjustment
  - Candidate skill prediction
- [ ] **Enhanced Gaming**
  - Additional game types (Sudoku, Chess Puzzles)
  - Multiplayer competitive mode
  - Custom puzzle creation interface
- [ ] **Enterprise Features**
  - SSO integration (Okta, Auth0)
  - White-label customization
  - Multi-language support
  - Advanced role management
- [ ] **Mobile App**
  - React Native mobile application
  - Offline mode support
  - Push notifications
- [ ] **Integration**
  - ATS system integrations (Greenhouse, Lever)
  - Slack/Teams notifications
  - Calendar scheduling
  - Video interview integration

**💡 Have a feature request?** [Open an issue](https://github.com/yourusername/skillquest-platform/issues/new) with the `feature-request` label!

---

## 🤝 Contributing

<div align="center">

![Contributors](https://img.shields.io/github/contributors/yourusername/skillquest-platform?style=flat)
![Issues](https://img.shields.io/github/issues/yourusername/skillquest-platform?style=flat)
![Pull Requests](https://img.shields.io/github/issues-pr/yourusername/skillquest-platform?style=flat)

</div>

We welcome contributions from the community! Whether it's bug fixes, new features, or documentation improvements, your input is valued.

### How to Contribute

1️⃣ **Fork the Repository**
```bash
# Click "Fork" button on GitHub, then:
git clone https://github.com/YOUR_USERNAME/skillquest-platform.git
cd skillquest-platform
```

2️⃣ **Create a Feature Branch**
```bash
git checkout -b feature/amazing-feature
```

3️⃣ **Make Your Changes**
- Write clean, documented code
- Follow existing code style
- Add tests for new features
- Update documentation as needed

4️⃣ **Commit Your Changes**
```bash
git add .
git commit -m "feat: add amazing feature"
```

5️⃣ **Push and Create PR**
```bash
git push origin feature/amazing-feature
# Open Pull Request on GitHub
```

---

### Contribution Guidelines

<table>
<tr>
<td width="50%" valign="top">

**✅ Do's**
- Follow TypeScript best practices
- Write meaningful commit messages
- Add JSDoc comments for functions
- Update relevant documentation
- Test your changes locally
- Keep PRs focused and atomic
- Respond to review feedback promptly

</td>
<td width="50%" valign="top">

**❌ Don'ts**
- Commit directly to `main` branch
- Include unrelated changes in PR
- Submit incomplete features
- Break existing functionality
- Ignore linting errors
- Add dependencies without justification
- Push sensitive data (keys, tokens)

</td>
</tr>
</table>

---

### Development Setup

```bash
# Install dependencies
npm run install:all        # Install both frontend & backend

# Run in development
npm run dev:backend        # Start backend on :5000
npm run dev:frontend       # Start frontend on :5173

# Run concurrently (requires concurrently package)
npm run dev                # Start both servers

# Linting
npm run lint               # Check code style
npm run lint:fix           # Auto-fix issues

# Type checking
npm run type-check         # TypeScript validation
```

---

### Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new game type
fix: resolve scoring calculation bug
docs: update API documentation
style: format code with prettier
refactor: simplify leaderboard logic
test: add unit tests for assessment controller
chore: update dependencies
```

---

## 💬 Support

- **📖 Documentation** - Check [docs/](docs/) folder for comprehensive guides
- **🐛 Issues** - Report bugs via [GitHub Issues](https://github.com/yourusername/skillquest-platform/issues)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Made with ❤️ by the SkillQuest Team**

[⬆ Back to Top](#-ifa-skillquest)

</div>
