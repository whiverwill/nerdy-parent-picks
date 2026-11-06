// Shared by app/family/actions.ts and proxy.ts.
// FAMILY_CODES: comma-separated list in Vercel env, e.g. "nerdy42,pp-family".
// FAMILY_CODE_SALT: any random string; changing it logs every device out.
// The cookie holds a hash, so removing a code from FAMILY_CODES logs out
// every device that used that code.

export const FAMILY_COOKIE = 'family'
export const ONE_YEAR = 60 * 60 * 24 * 365

const normalize = (code: string) => code.toLowerCase().replace(/\s+/g, '')

export function familyCodes(): string[] {
  return (process.env.FAMILY_CODES ?? '').split(',').map(normalize).filter(Boolean)
}

export async function familyCodeHash(code: string): Promise<string> {
  const data = new TextEncoder().encode((process.env.FAMILY_CODE_SALT ?? '') + ':' + normalize(code))
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('')
}

export async function isValidFamilyCode(code: string): Promise<boolean> {
  return familyCodes().includes(normalize(code))
}

/** For proxy.ts: is this cookie value the hash of a current code? */
export async function isValidFamilyCookie(value: string | undefined): Promise<boolean> {
  if (!value) return false
  const hashes = await Promise.all(familyCodes().map(familyCodeHash))
  return hashes.includes(value)
}
