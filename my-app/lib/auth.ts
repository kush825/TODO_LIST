import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-change-it'
const key = new TextEncoder().encode(SECRET_KEY)

export interface SessionPayload {
    userId: number
    email: string
    name: string
    [key: string]: any
}

export async function signSession(payload: SessionPayload) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h')
        .sign(key)
}

export async function verifySession(token: string) {
    try {
        const { payload } = await jwtVerify(token, key)
        return payload as unknown as SessionPayload
    } catch (error) {
        return null
    }
}

export async function getSession(): Promise<SessionPayload | null> {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value
    if (!session) return null
    return await verifySession(session)
}

export async function setSession(token: string) {
    const cookieStore = await cookies()
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        path: '/',
    })
}

export async function clearSession() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
}
