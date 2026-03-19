import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signSession, setSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { email, password } = body

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const user = await prisma.users.findUnique({
            where: { Email: email },
            include: {
                userroles: {
                    include: {
                        roles: true
                    }
                }
            }
        })

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const isValid = await bcrypt.compare(password, user.PasswordHash)

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
        }

        const primaryRole = user.userroles[0]?.roles.RoleName || 'TeamMember';

        const token = await signSession({
            userId: user.UserID,
            email: user.Email,
            name: user.UserName,
            role: primaryRole
        })

        // We can't use setSession here directly because it tries to set cookies via next/headers which isn't for route handlers in the same way.
        // Actually next/headers cookies() works in Route Handlers.
        await setSession(token)

        const isAdmin = user.userroles.some((ur: any) => ur.roles.RoleName === 'Admin')

        return NextResponse.json({
            success: true,
            redirectUrl: isAdmin ? '/admin' : '/dashboard'
        })
    } catch (error) {
        console.error('Login API error:', error)
        return NextResponse.json({ error: 'Login failed' }, { status: 500 })
    }
}
