import { NextResponse } from 'next/server';
import db from '../../../../lib/db';
import { verifyPassword, generateSessionToken } from '../../../../lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { email, password, exam } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValid = verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Live Override Target Exam dynamically if provided at Login
    if (exam && exam.trim().length > 0 && exam !== user.exam) {
      db.prepare('UPDATE users SET exam = ? WHERE id = ?').run(exam, user.id);
      user.exam = exam;
    }

    // Create session
    const token = generateSessionToken(user.id);
    
    // Set HTTP-Only Cookie
    cookies().set('abhay_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 // 30 days
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, name: user.name, email: user.email, exam: user.exam, role: user.role } 
    });

  } catch (error) {
    console.error('Login Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
