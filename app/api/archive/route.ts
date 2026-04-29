export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySessionToken } from '../../../lib/auth';
import db from '../../../lib/db';

export async function GET(request: Request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('abhay_session')?.value;
    const session = token ? verifySessionToken(token) : null;
    
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.userId;

    const notes = db.prepare('SELECT * FROM generated_notes WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    const evaluations = db.prepare('SELECT * FROM evaluations WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    const paths = db.prepare('SELECT * FROM learning_paths WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    const savedResources = db.prepare('SELECT * FROM saved_resources WHERE user_id = ? ORDER BY created_at DESC').all(userId);
    
    // Group conversations by session_id
    const rawConversations = db.prepare('SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at ASC').all(userId) as any[];
    
    const chatSessionsMap = new Map();
    for (const msg of rawConversations) {
        if (!chatSessionsMap.has(msg.session_id)) {
            chatSessionsMap.set(msg.session_id, {
                sessionId: msg.session_id,
                subject: msg.subject,
                createdAt: msg.created_at,
                messages: []
            });
        }
        chatSessionsMap.get(msg.session_id).messages.push({
            role: msg.role,
            content: msg.content,
            createdAt: msg.created_at
        });
    }
    
    // Convert to array and sort by latest
    const chats = Array.from(chatSessionsMap.values()).sort((a, b) => 
       new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json({
        notes,
        evaluations,
        paths,
        savedResources,
        chats
    });

  } catch (error) {
     console.error('History API Error:', error);
     return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
  }
}
