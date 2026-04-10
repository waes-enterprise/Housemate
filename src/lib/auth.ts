import { pbkdf2, randomBytes, timingSafeEqual } from 'crypto'
import { promisify } from 'util'
import { createToken, verifyToken, JWTPayload } from './jwt'

export { createToken, verifyToken, type JWTPayload }

const pbkdf2Async = promisify(pbkdf2) as (
  password: string | Buffer,
  salt: string | Buffer,
  iterations: number,
  keylen: number,
  digest: string
) => Promise<Buffer>

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await pbkdf2Async(password, salt, 10000, 64, 'sha512')
  return `${salt}:${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const [salt, key] = hash.split(':')
  if (!salt || !key) return false
  const derivedKey = await pbkdf2Async(password, salt, 10000, 64, 'sha512')
  try {
    return timingSafeEqual(derivedKey, Buffer.from(key, 'hex'))
  } catch {
    return false
  }
}
