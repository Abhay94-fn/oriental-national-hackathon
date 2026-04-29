import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '../../../../lib/db';
import { verifySessionToken } from '../../../../lib/auth';

export async function GET() {
  const token = cookies().get('abhay_session')?.value;
  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = verifySessionToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const user = db.prepare('SELECT id, name, email FROM users WHERE id = ?').get(payload.userId) as any;
  if (!user) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}
