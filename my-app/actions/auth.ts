'use server'

import { prisma } from '@/lib/prisma'
import { signSession, setSession, clearSession } from '@/lib/auth'
import bcrypt from 'bcryptjs'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function register(formData: FormData) {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!name || !email || !password) {
        return { error: 'Missing fields' }
    }

    try {
        const existingUser = await prisma.users.findUnique({
            where: { Email: email },
        })

        if (existingUser) {
            return { error: 'User already exists' }
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

    } catch (error) {
        console.error('Registration error:', error)
        return { error: 'Registration failed' }
    }

    return { success: true }
}

export async function login(formData: FormData) {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (!email || !password) {
        return { error: 'Missing fields' }
    }

    try {
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
            return { error: 'Invalid credentials' }
        }

        const isValid = await bcrypt.compare(password, user.PasswordHash)

        if (!isValid) {
            return { error: 'Invalid credentials' }
        }

        const token = await signSession({ userId: user.UserID, email: user.Email, name: user.UserName })
        await setSession(token)

        const isAdmin = user.userroles.some((ur: any) => ur.roles.RoleName === 'Admin')

        if (isAdmin) {
            redirect('/admin')
        }

    } catch (error) {
        // Next.js redirect throws an error, so we need to re-throw it if it's a redirect
        if ((error as any).digest?.startsWith('NEXT_REDIRECT')) {
            throw error
        }
        console.error('Login error:', error)
        return { error: 'Login failed' }
    }

    redirect('/dashboard')
}

export async function logout() {
    await clearSession()
    redirect('/auth/login')
}
