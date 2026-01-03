import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'supersecretkey123';
const key = new TextEncoder().encode(secretKey);

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function getSession(request) {
    // Check cookies first
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      const token = cookieHeader.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
      if (token) {
        const payload = await verifyToken(token);
        if (payload) return payload;
      }
    }
    
    // Check Authorization header as fallback (if you use Bearer tokens)
    const authHeader = request.headers.get('Authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = await verifyToken(token);
      if (payload) return payload;
    }

    return null;
}
