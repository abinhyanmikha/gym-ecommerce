import crypto from 'crypto';

export function generateEsewaSignature(secretKey, message) {
  const hmac = crypto.createHmac('sha256', secretKey);
  hmac.update(message);
  return hmac.digest('base64');
}
