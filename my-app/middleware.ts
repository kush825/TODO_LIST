import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifySession } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value

    // Verify session
    let verifiedPayload = null
    if (session) {
        verifiedPayload = await verifySession(session)
    }

    // Public paths
    if (request.nextUrl.pathname.startsWith('/auth') || request.nextUrl.pathname === '/') {
        if (verifiedPayload) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
        return NextResponse.next()
    }

    // Protected paths
    if (!verifiedPayload) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*', '/'],
}
