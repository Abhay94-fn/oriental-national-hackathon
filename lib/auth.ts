import crypto from 'crypto';

// Use Node's native crypto for zero-dependency password hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(':')) return false;
  const [salt, key] = storedHash.split(':');
  const hashBuffer = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512');
  const keyBuffer = Buffer.from(key, 'hex');
  
  if (hashBuffer.length !== keyBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, keyBuffer);
}

// Simple token generation for hackathon session
export function generateSessionToken(userId: string): string {
  const data = JSON.stringify({ userId, exp: Date.now() + 1000 * 60 * 60 * 24 }); // 24h
  const signature = crypto.createHmac('sha256', process.env.APP_SECRET || 'hackathon-secret-key-123')
                          .update(data)
                          .digest('hex');
  return Buffer.from(`${data}.${signature}`).toString('base64');
}

export function verifySessionToken(base64Token: string): { userId: string } | null {
  try {
    const raw = Buffer.from(base64Token, 'base64').toString('utf-8');
    const [data, signature] = raw.split('.');
    
    const expectedSignature = crypto.createHmac('sha256', process.env.APP_SECRET || 'hackathon-secret-key-123')
                                    .update(data)
                                    .digest('hex');
                                    
    if (signature !== expectedSignature) return null;
    
    const parsed = JSON.parse(data);
    if (parsed.exp < Date.now()) return null; // expired
    
    return { userId: parsed.userId };
  } catch (e) {
    return null;
  }
}
