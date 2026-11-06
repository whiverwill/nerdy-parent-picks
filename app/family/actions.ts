'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { FAMILY_COOKIE, ONE_YEAR, familyCodeHash, isValidFamilyCode } from '@/lib/family-code'

export type FamilyCodeState = { wrong: boolean }

export async function submitFamilyCode(
  _prev: FamilyCodeState,
  form: FormData,
): Promise<FamilyCodeState> {
  const code = String(form.get('code') ?? '')
  const rawNext = String(form.get('next') ?? '/')
  // Only allow same-site paths, never an outside URL.
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/'

  if (!(await isValidFamilyCode(code))) return { wrong: true }

  const jar = await cookies()
  jar.set(FAMILY_COOKIE, await familyCodeHash(code), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ONE_YEAR,
  })
  redirect(next)
}
