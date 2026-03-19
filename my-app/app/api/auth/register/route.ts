import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendWelcomeEmail } from '@/lib/mail'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { name, email, password } = body

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
        }

        const existingUser = await prisma.users.findUnique({
            where: { Email: email },
        })

        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        // Create user
        const newUser = await prisma.users.create({
            data: {
                UserName: name,
                Email: email,
                PasswordHash: hashedPassword,
            },
        })

        // Assign default role 'User'
        let userRole = await prisma.roles.findUnique({ where: { RoleName: 'User' } })
        if (!userRole) {
            userRole = await prisma.roles.create({ data: { RoleName: 'User' } })
        }

        await prisma.userroles.create({
            data: {
                UserID: newUser.UserID,
                RoleID: userRole.RoleID,
            },
        })

        // Send welcome email (async, don't block response)
        sendWelcomeEmail(email, name).catch(err => {
            console.error('Failed to send welcome email:', err)
        })

        return NextResponse.json({ success: true, userId: newUser.UserID })
    } catch (error) {
        console.error('Registration API error:', error)
        return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
    }
}
