# HackMatch AI – Hackathon Management & Matchmaking Portal

> **🌐 Live Production Website**: [https://dhakshii008.github.io/HackMatch-AI/](https://dhakshii008.github.io/HackMatch-AI/)

HackMatch AI is a full-stack, production-ready hackathon management platform engineered to connect participants, facilitate AI-driven complementary matchmaking, manage team workspaces, streamline submissions, and conduct real-time evaluations with verifiable digital awards.

---

## 🌟 Key Features

- **Quick Demo Access & Multi-Role Authentication**: Instant sign-in with 15 pre-seeded role accounts (participants, organizers, judges, mentors) or custom JWT-based email registration.
- **AI Skill & Resume Analysis**: Instant extraction and scoring of developer skills, frameworks, and tools from uploaded PDF resumes using an intelligent taxonomy parser.
- **Complementary Teammate Matchmaking**: Algorithmic scoring that calculates skill complementarity, overlap bonuses, and personalized match explanations to help solo developers assemble winning teams.
- **Team Workspace & Real-Time Collaboration**: Real-time Socket.IO chat, task management Kanban, shared project details, and GitHub repository integration.
- **Problem Statement Registry**: Multi-domain challenges (AI, FinTech, Healthcare, Web3, Smart Cities) with difficulty tiers and domain filtering.
- **Project Submissions & Auto-Evaluation**: Automated baseline project scoring based on innovation, technology stack depth, repository links, and impact.
- **Judge Portal & Live Leaderboards**: Real-time scoring interface for evaluators with automated award tiering and dynamic public leaderboards.
- **Verifiable Digital Certificates**: Cryptographically unique certificate generation with downloadable PDF credentials and instant public verification links.

---

## 🏗️ Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────┐
│                   Frontend (React + Vite)              │
│  - Tailwind CSS, Lucide Icons, Framer Motion           │
│  - Zustand State Management, Axios, Socket.IO Client   │
│  - Hosted on Vercel / Render Static                    │
└───────────────────────────┬────────────────────────────┘
                            │ HTTPS / WSS
┌───────────────────────────▼────────────────────────────┐
│               Backend API (Node.js + Express)          │
│  - RESTful API, Socket.IO Real-time Engine             │
│  - PDF Resume Extraction, Scoring Algorithms           │
│  - Hosted on Render Web Service                        │
└───────────────────────────┬────────────────────────────┘
                            │ Persistent Connection
┌───────────────────────────▼────────────────────────────┐
│            Database (MongoDB Atlas Cloud)              │
│  - Persistent Cloud Collections (Users, Teams, etc.)   │
│  - Auto-seeding of 15 Demo Accounts & Problem Bank     │
└────────────────────────────────────────────────────────┘
```

### Technologies Used
- **Frontend**: React 18, Vite 4, Tailwind CSS, Zustand, Axios, Socket.IO Client, Framer Motion, jsPDF, html2canvas
- **Backend**: Node.js, Express 4, Socket.IO, Mongoose 7, Multer, pdf-parse, Helmet, Morgan, JSON Web Tokens (JWT), bcryptjs
- **Database**: MongoDB Atlas (Cloud)
- **Deployment**: Vercel (Frontend), Render (Backend & Static), GitHub CI/CD

---

## ⚙️ Environment Variables

### Backend Configuration (`backend/.env`)

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/hackmatch?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CLIENT_URL=https://hackmatch-ai.vercel.app,https://hackmatch-ai.onrender.com
```

### Frontend Configuration (`frontend/.env` or Platform Settings)

```env
VITE_API_URL=https://hackmatch-api.onrender.com
VITE_CLIENT_URL=https://hackmatch-ai.vercel.app
```

---

## 🚀 Local Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm
- MongoDB instance (local or MongoDB Atlas)

### 1. Clone the Repository
```bash
git clone https://github.com/Dhakshii008/HackMatch-AI.git
cd HackMatch-AI
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env # or configure environment variables
npm run seed:demo    # optional: populate demo accounts
npm start            # runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev          # runs on http://localhost:5173
```

---

## ☁️ Cloud Deployment Architecture

### 1. Backend on Render
1. Create a new **Web Service** on [Render](https://render.com).
2. Connect the GitHub repository `Dhakshii008/HackMatch-AI`.
3. Set **Root Directory** to `backend`.
4. Set **Build Command** to `npm install`.
5. Set **Start Command** to `npm start`.
6. Add the following Environment Variables in the Render dashboard:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<A strong random string>`
   - `JWT_EXPIRE`: `7d`
   - `CLIENT_URL`: `https://hackmatch-ai.vercel.app` (or your frontend domain)

### 2. Frontend on Vercel
1. Go to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import the `Dhakshii008/HackMatch-AI` repository.
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add Environment Variable:
   - `VITE_API_URL`: `https://<your-render-backend-name>.onrender.com`
5. Click **Deploy**.

*(Alternatively, both frontend and backend can be launched simultaneously on Render using the included `render.yaml` Blueprint).*

---

## 🔄 Automatic Deployment & Updates

The project is connected to GitHub (`origin/main`). Any push to `main` automatically triggers new builds and deployments on both Vercel and Render without manual intervention:
```bash
git add .
git commit -m "feat: improve performance"
git push origin main
```

