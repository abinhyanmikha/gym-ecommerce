import { SignJWT, jwtVerify } from 'jose';

const secretKey = process.env.JWT_SECRET || 'supersecretkey123';
const key = new TextEncoder().encode(secretKey);

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1d')
    .sign(key);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

export async function getSession(request) {
    const cookieHeader = request.headers.get('cookie');
    if (!cookieHeader) return null;
    
    const token = cookieHeader.split(';').find(c => c.trim().startsWith('token='))?.split('=')[1];
    if (!token) return null;

    return await verifyToken(token);
}
