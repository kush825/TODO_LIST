import { NextRequest, NextResponse } from 'next/server'
import { clearSession } from '@/lib/auth'

export async function POST(req: NextRequest) {
    await clearSession()
    return NextResponse.json({ success: true, message: 'Logged out successfully' })
}

// Support GET for simple logout links if needed
export async function GET(req: NextRequest) {
    await clearSession()
    return NextResponse.json({ success: true, message: 'Logged out successfully' })
}
