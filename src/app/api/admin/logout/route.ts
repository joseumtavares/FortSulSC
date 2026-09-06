import { NextResponse, type NextRequest } from 'next/server'
import { signOut } from '@/lib/auth/config'
import { isSameOriginRequest } from '@/lib/auth/origin-check'

export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: 'Origem inválida.' }, { status: 403 })
  }

  await signOut({ redirect: false })
  return NextResponse.json({ step: 'logged_out' }, { status: 200 })
}
