import Database from 'better-sqlite3';
import path from 'path';

// Note: In Next.js App Router, this file runs on the server.
const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'mentor.db');
const db = new Database(dbPath, { timeout: 15000 });

db.pragma('journal_mode = WAL');

export function initializeDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      password_hash TEXT,
      exam TEXT DEFAULT 'General Competitive Exams',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS generated_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      topic TEXT NOT NULL,
      subtopic TEXT NOT NULL,
      summary TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      source TEXT DEFAULT 'manual',
      ef REAL DEFAULT 2.5,
      interval INTEGER DEFAULT 1,
      reps INTEGER DEFAULT 0,
      next_review TEXT NOT NULL,
      strength INTEGER DEFAULT 10,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS concepts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      topic TEXT NOT NULL,
      subtopic TEXT NOT NULL,
      summary TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      source TEXT DEFAULT 'manual',
      ef REAL DEFAULT 2.5,
      interval INTEGER DEFAULT 1,
      reps INTEGER DEFAULT 0,
      next_review TEXT NOT NULL,
      strength INTEGER DEFAULT 10,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      session_type TEXT NOT NULL,
      subject TEXT,
      duration_minutes INTEGER DEFAULT 0,
      concepts_reviewed INTEGER DEFAULT 0,
      score_pct INTEGER,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      exam TEXT NOT NULL,
      exam_date TEXT NOT NULL,
      daily_hours INTEGER NOT NULL,
      weak_areas TEXT NOT NULL,
      plan_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS test_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      subject TEXT NOT NULL,
      topic TEXT,
      difficulty TEXT NOT NULL,
      total_questions INTEGER NOT NULL,
      correct INTEGER NOT NULL,
      score_pct INTEGER NOT NULL,
      time_per_q_avg INTEGER,
      weak_concepts TEXT,
      questions_json TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      subject TEXT DEFAULT 'General',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lab_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      youtube_url TEXT NOT NULL,
      video_id TEXT NOT NULL,
      title TEXT,
      subject TEXT,
      language TEXT DEFAULT 'English',
      notes_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      name TEXT NOT NULL DEFAULT 'Student',
      exam TEXT NOT NULL DEFAULT 'JEE',
      exam_date TEXT NOT NULL,
      daily_hours INTEGER DEFAULT 6,
      streak INTEGER DEFAULT 0,
      last_active TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      subject TEXT NOT NULL,
      question TEXT NOT NULL,
      student_answer TEXT NOT NULL,
      score INTEGER NOT NULL,
      feedback TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS learning_paths (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      target_exam TEXT NOT NULL,
      current_level TEXT NOT NULL,
      path_json TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS saved_resources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      url TEXT,
      description TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      week_start TEXT NOT NULL,
      week_end TEXT NOT NULL,
      report_markdown TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Migrate existing tables to add user_id
  const tablesToMigrate = ['generated_notes', 'conversations', 'evaluations', 'learning_paths', 'concepts', 'sessions', 'plans', 'test_results'];
  for (const table of tablesToMigrate) {
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN user_id TEXT`);
    } catch (e: any) {
      // Ignore if column already exists
      if (!e.message.includes('duplicate column name')) {
        console.error(`Migration error for ${table}:`, e.message);
      }
    }
  }

  // Seed Concepts if empty
  const count = db.prepare('SELECT COUNT(*) as c FROM concepts').get() as { c: number };
  if (count.c === 0) {
    const todayISO = new Date().toISOString().slice(0, 10);
    const insertConcept = db.prepare(`
      INSERT INTO concepts (user_id, topic, subtopic, summary, tags, ef, interval, reps, strength, next_review)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const SEED_CONCEPTS = [
      { topic: 'Physics', subtopic: "Newton's Laws of Motion", summary: "F=ma. Inertia resists change. Action-reaction pairs are equal and opposite. Key: net force = rate of change of momentum.", tags: '["Mechanics", "JEE Core"]', ef: 2.5, interval: 1, reps: 0, strength: 35 },
      { topic: 'Physics', subtopic: 'Thermodynamics', summary: "First law: ΔU=Q-W. Second law: entropy increases. PV=nRT for ideal gas. Carnot efficiency: η=1-T₂/T₁.", tags: '["Heat", "JEE Core"]', ef: 2.5, interval: 3, reps: 2, strength: 72 },
      { topic: 'Physics', subtopic: 'Electromagnetic Induction', summary: "Faraday: EMF=-dΦ/dt. Lenz law: induced current opposes change. Motional EMF=Blv. Self inductance L=NΦ/I.", tags: '["Electricity", "High Weightage"]', ef: 2.1, interval: 1, reps: 0, strength: 28 },
      { topic: 'Chemistry', subtopic: 'Periodic Table & Trends', summary: "Atomic radius decreases across period, increases down group. IE, EA, EN increase across period. Exception: N>O for EA.", tags: '["Inorganic", "NCERT Direct"]', ef: 2.5, interval: 6, reps: 1, strength: 62 },
      { topic: 'Chemistry', subtopic: 'Chemical Bonding', summary: "VSEPR: lone pairs > bonding pairs in repulsion. sp3: tetrahedral 109.5°, sp2: trigonal 120°, sp: linear 180°. Bond order ↑ → length ↓ → energy ↑.", tags: '["Physical Chemistry"]', ef: 2.3, interval: 2, reps: 1, strength: 45 },
      { topic: 'Chemistry', subtopic: 'Organic: Reaction Mechanisms', summary: "SN1: carbocation intermediate, racemization. SN2: backside attack, inversion. E1 vs E2 depends on base strength. Markovnikov: H adds to less substituted C.", tags: '["Organic", "High Weightage"]', ef: 2.0, interval: 1, reps: 0, strength: 20 },
      { topic: 'Maths', subtopic: 'Quadratic Equations', summary: "ax²+bx+c=0. D=b²-4ac. Sum of roots=-b/a, product=c/a. If D<0: complex roots. Nature of roots depends on D sign.", tags: '["Algebra", "JEE Core"]', ef: 2.5, interval: 1, reps: 0, strength: 38 },
      { topic: 'Maths', subtopic: 'Integration Techniques', summary: "∫by parts: ∫uv'=uv-∫u'v (ILATE rule). Substitution: match inner derivative. Partial fractions for rational functions.", tags: '["Calculus", "JEE Advanced"]', ef: 2.1, interval: 1, reps: 0, strength: 18 },
      { topic: 'Maths', subtopic: 'Coordinate Geometry: Circles', summary: "Standard: x²+y²=r². General: x²+y²+2gx+2fy+c=0, center(-g,-f), r=√(g²+f²-c). Tangent: xx₁+yy₁=r².", tags: '["Geometry", "JEE Core"]', ef: 2.4, interval: 4, reps: 2, strength: 68 },
    ];

    const initTransaction = db.transaction(() => {
        for (const c of SEED_CONCEPTS) {
            insertConcept.run('anonymous', c.topic, c.subtopic, c.summary, c.tags, c.ef, c.interval, c.reps, c.strength, todayISO);
        }
    });

    initTransaction();
  }
}

// Ensure the DB is initialized when this file is imported
initializeDB();

export default db;
