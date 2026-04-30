<div align="center">
  <img src="./public/Mentor.png" alt="Mentor Logo" width="200" />

# 🏆 Mentor
### *Guidance when you need it most.*

**Oriental TechHack 2.0 National Level Hackathon**
*Problem Statement 6: AI-powered education assistant*

> 👥 **Team Name:** Tech Stackers

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Anthropic](https://img.shields.io/badge/Powered%20by-Claude%20AI-blueviolet?style=for-the-badge)](https://www.anthropic.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Demo-brightgreen?style=for-the-badge&logo=vercel)](https://abhay-parth.vercel.app)
[![Render](https://img.shields.io/badge/Render-Demo-46E3B7?style=for-the-badge&logo=render)](https://abhayparth.onrender.com)

</div>

---

## 🎯 What is Mentor?

**Mentor** is an AI-powered study companion purpose-built for Indian competitive exam aspirants — JEE, NEET, UPSC, and beyond. Named after the fearless archer Arjuna (Parth), it combines the power of large language models with scientifically-backed learning techniques to make every study session count.

No more scattered notes. No more forgotten concepts. No more aimless grinding.

> *"Most students don't fail because they lack intelligence. They fail because they lack the right system."*

Mentor **is** that system.

---

## ✨ Features

### 📊 Dashboard
A bird's-eye view of your preparation journey — study streaks, daily progress, exam countdown, and analytics — all in one glanceable screen.

### 🤖 AI Tutor
A conversational doubt-solving engine powered by Claude AI. Ask anything — from thermodynamics to organic chemistry to polity — and get clear, exam-oriented explanations instantly.

### 🧠 Retention Engine
Built on the **SM-2 spaced repetition algorithm**, the Retention Engine surfaces concepts at the exact moment your brain is about to forget them — maximizing long-term retention with minimum effort.

### 🎬 Study Lab
Paste any YouTube lecture URL and get back a structured set of notes, key points, and summaries. Turn hours of video into scannable, reviewable knowledge in seconds.

### 📝 Practice Arena
Generates targeted practice sets based on your weak areas, followed by detailed performance analysis to close the loop on learning.

### 📅 Smart Planner
Automatically generates a 7-day personalized study schedule, with drag-and-drop session management so you stay in control.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| AI Engine | Anthropic Claude (via API) |
| Database | SQLite (`better-sqlite3`) |
| State Management | Zustand |
| Charts | Recharts |
| Animations | Framer Motion |
| Icons | Lucide React |
| Drag & Drop | `@dnd-kit` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm
- An [Anthropic API key](https://console.anthropic.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Roxtop07/AbhayParth.git
cd AbhayParth

# 2. Install dependencies
npm install

# 3. Set up environment variables
cat > .env.local << 'EOF'
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_PATH=./mentor.db
EOF

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and start your prep! 🎯

---

## 📁 Project Structure

```
AbhayParth/
├── app/
│   ├── api/
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── concepts/
│   │   ├── lab/
│   │   ├── planner/
│   │   ├── practice/
│   │   └── tutor/
│   ├── dashboard/
│   ├── lab/
│   ├── planner/
│   ├── practice/
│   ├── retention/
│   └── tutor/
├── components/
│   ├── lab/
│   ├── layout/
│   ├── planner/
│   ├── practice/
│   ├── retention/
│   ├── tutor/
│   └── ui/
├── lib/
│   ├── api.ts          # API utilities
│   ├── auth.ts         # Authentication logic
│   ├── claude.ts       # Claude AI integration
│   ├── db.ts           # SQLite DB setup (auto-initializes tables)
│   ├── sm2.ts          # SM-2 spaced repetition algorithm
│   └── youtube.ts      # YouTube transcript pipeline
├── store/              # Zustand state stores
└── types/              # Shared TypeScript types
```

---

## ⚙️ Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | ✅ Yes | Your Anthropic API key for Claude AI |
| `DATABASE_PATH` | ❌ Optional | Path to SQLite file (defaults to `./mentor.db`) |

> ⚠️ Never commit your `.env.local` file. The database auto-initializes on first server start.

---

## 📜 Available Scripts

```bash
npm run dev       # Start local development server
npm run build     # Build production bundle
npm run start     # Run production server
npm run lint      # Run ESLint
npm run db:reset  # Reset the SQLite database
```

---

## 🏅 Hackathon

This project was built for **Oriental TechHack 2.0 National Level Hackathon**.

The challenge (Statement 6) demanded an AI-powered education assistant for students and teachers. Mentor was conceived, designed, and shipped to address exactly this, providing a comprehensive RAG-powered AI platform with a dedicated Teacher Dashboard and Student Learning Portal.

---

## 👥 Team — Tech Stackers

Built with ❤️ by four students who believe better tools make better learners.

| Name | Role |
|---|---|
| **Manish Srivastav** | Team Lead · Backend & Frontend |
| **Aakash Sarang** | Full Stack & AI Integration |
| **Shreya Jaiswal** | Frontend, UI/UX & Architecture |
| **Abhay Dwivedi** | Presenter & Documentation |

---

## 🌐 Live Demo

| Platform | Link |
|---|---|
| Vercel | 👉 [mentor-oriental.vercel.app](https://mentor-oriental.vercel.app) |

---

## 📄 License

MIT © 2026 Team Tech Stackers — Manish Srivastav, Aakash Sarang, Shreya Jaiswal & Abhay Dwivedi.

---

<div align="center">

**Mentor gives you that system.**

⭐ Star this repo if it inspired you!

</div>
