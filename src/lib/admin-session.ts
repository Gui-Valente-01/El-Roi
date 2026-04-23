const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

export const ADMIN_SESSION_COOKIE_NAME = 'elroi-admin-session';
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 12;

type AdminSessionPayload = {
  exp: number;
  role: 'admin';
};

function encodeBase64UrlFromBytes(bytes: Uint8Array) {
  let binary = '';

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64UrlToBytes(value: string) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4 === 0 ? '' : '='.repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function encodeBase64Url(value: string) {
  return encodeBase64UrlFromBytes(textEncoder.encode(value));
}

function decodeBase64Url(value: string) {
  return textDecoder.decode(decodeBase64UrlToBytes(value));
}

function getAdminSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || '';
}

async function getHmacKey(secret: string) {
  return crypto.subtle.importKey(
    'raw',
    textEncoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
}

async function signValue(value: string, secret: string) {
  const key = await getHmacKey(secret);
  const signature = await crypto.subtle.sign('HMAC', key, textEncoder.encode(value));
  return encodeBase64UrlFromBytes(new Uint8Array(signature));
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let mismatch = 0;

  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return mismatch === 0;
}

export function getCookieValueFromHeader(cookieHeader: string | null, cookieName: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(';');

  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();

    if (trimmedCookie.startsWith(`${cookieName}=`)) {
      return decodeURIComponent(trimmedCookie.slice(cookieName.length + 1));
    }
  }

  return null;
}

export async function createAdminSessionToken() {
  const secret = getAdminSessionSecret();

  if (!secret) {
    throw new Error('ADMIN_SESSION_SECRET nao configurada.');
  }

  const payload: AdminSessionPayload = {
    exp: Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000,
    role: 'admin',
  };

  const encodedPayload = encodeBase64Url(JSON.stringify(payload));
  const signature = await signValue(encodedPayload, secret);

  return `${encodedPayload}.${signature}`;
}

export async function verifyAdminSessionToken(token: string | null | undefined) {
  const secret = getAdminSessionSecret();

  if (!token || !secret) {
    return false;
  }

  const [encodedPayload, receivedSignature] = token.split('.');

  if (!encodedPayload || !receivedSignature) {
    return false;
  }

  const expectedSignature = await signValue(encodedPayload, secret);

  if (!constantTimeEqual(receivedSignature, expectedSignature)) {
    return false;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as AdminSessionPayload;
    return payload.role === 'admin' && payload.exp > Date.now();
  } catch {
    return false;
  }
}

export function getAdminSessionCookieOptions() {
  return {
    httpOnly: true,
    maxAge: ADMIN_SESSION_TTL_SECONDS,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
  };
}

export function getExpiredAdminSessionCookieOptions() {
  return {
    ...getAdminSessionCookieOptions(),
    maxAge: 0,
  };
}
