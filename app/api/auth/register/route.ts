import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { hashPassword } from '../../../../lib/auth';

export async function POST(req: Request) {
  try {
    const { name, email, password, exam } = await req.json();

    if (!name || !email || !password || password.length < 6) {
      return NextResponse.json({ error: 'Invalid input. Password must be 6+ characters.' }, { status: 400 });
    }

    // Check existing
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const hash = hashPassword(password);
    const targetExam = exam || 'General Competitive Exams';

    // Force schema synchronization on the active open connection (helps if dev server is hot-reloading)
    try { db.exec("ALTER TABLE users ADD COLUMN exam TEXT DEFAULT 'General Competitive Exams'"); } catch(e) {}

    db.prepare('INSERT INTO users (id, name, email, password_hash, exam) VALUES (?, ?, ?, ?, ?)')
      .run(id, name, email, hash, targetExam);

    return NextResponse.json({ 
      success: true, 
      message: 'Account created successfully!',
      user: { name, exam: targetExam }
    });

  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
