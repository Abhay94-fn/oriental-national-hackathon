# AbhayParth

AI-powered study companion for Indian competitive exam preparation, built with Next.js and TypeScript.

## What This Project Does

AbhayParth combines guided study planning, AI tutoring, spaced repetition, and question practice in one app.

Core modules:

- Dashboard: progress snapshot, streaks, countdown, and analytics
- AI Tutor: conversational doubt-solving and explanations
- Retention Engine: SM-2 based concept review workflow
- Study Lab: YouTube video to structured notes pipeline
- Practice Arena: generated practice sets with analysis
- Planner: 7-day schedule generation and session organization

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- SQLite (`better-sqlite3`)
- Zustand
- Recharts
- Framer Motion
- Lucide React
- `@dnd-kit` (drag and drop)

## Prerequisites

- Node.js 18+
- npm

## Quick Start

1. Clone and install dependencies.

```bash
git clone https://github.com/Roxtop07/AbhayParth.git
cd AbhayParth
npm install
```

2. Create an environment file.

```bash
cat > .env.local << 'EOF'
ANTHROPIC_API_KEY=your_api_key_here
DATABASE_PATH=./abhayparth.db
EOF
```

3. Start development server.

```bash
npm run dev
```

4. Open http://localhost:3000

## Environment Variables

- `ANTHROPIC_API_KEY`: API key used by the AI completion layer
- `DATABASE_PATH` (optional): SQLite file path (defaults to `./abhayparth.db`)

## Available Scripts

- `npm run dev`: start local development server
- `npm run build`: build production bundle
- `npm run start`: run production server
- `npm run lint`: run ESLint
- `npm run db:reset`: reset DB (script command exists in `package.json`)

## High-Level Structure

```text
app/
   api/
      analytics/
      auth/
      concepts/
      lab/
      planner/
      practice/
      tutor/
   dashboard/
   lab/
   login/
   planner/
   practice/
   register/
   retention/
   tutor/

components/
   lab/
   layout/
   planner/
   practice/
   retention/
   tutor/
   ui/

lib/
   api.ts
   auth.ts
   claude.ts
   db.ts
   sm2.ts
   youtube.ts

store/
types/
```

## Notes

- Database tables are initialized automatically when server code imports `lib/db.ts`.
- The app currently includes multiple API endpoints under `app/api/*` for auth, tutor, planner, practice, lab, and analytics flows.
- For production use, configure secrets only via environment variables and rotate any previously exposed keys.

## Contributing

1. Create a feature branch.
2. Make your changes.
3. Run lint/build locally.
4. Open a pull request.

## License

MIT
