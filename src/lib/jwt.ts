import { SignJWT, jwtVerify } from 'jose'

const DEFAULT_SECRET = 'housemate-zm-secret-key-change-in-production'

let _secret: Uint8Array | undefined

function getSecret(): Uint8Array {
  if (_secret) return _secret

  if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error(
      'JWT_SECRET environment variable is required in production. ' +
        'Please set it to a long random string (e.g., generate with `openssl rand -base64 32`).'
    )
  }

  const secret = process.env.JWT_SECRET || DEFAULT_SECRET

  if (!process.env.JWT_SECRET) {
    console.warn(
      '[Security] Using default JWT secret. This is insecure for production. ' +
        'Set the JWT_SECRET environment variable to override.'
    )
  }

  _secret = new TextEncoder().encode(secret)
  return _secret
}

export interface JWTPayload {
  userId: string
  email: string
  name: string
  role: string
}

export async function createToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    }
  } catch {
    return null
  }
}
