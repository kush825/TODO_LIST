'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function isAdmin() {
    const session = await getSession()
    if (!session) return false

    // Check if user has Admin role
    const userRole = await prisma.userroles.findFirst({
        where: {
            UserID: session.userId as number,
            roles: {
                RoleName: 'Admin'
            }
        }
    })

    return !!userRole
}

export async function getAdminStats() {
    if (!await isAdmin()) return null

    const [userCount, projectCount, taskCount] = await Promise.all([
        prisma.users.count(),
        prisma.projects.count(),
        prisma.tasks.count()
    ])

    return {
        users: userCount,
        projects: projectCount,
        tasks: taskCount
    }
}

export async function getUsers() {
    if (!await isAdmin()) return []

    return await prisma.users.findMany({
        select: {
            UserID: true,
            UserName: true,
            Email: true,
            CreatedAt: true,
            userroles: {
                include: {
                    roles: true
                }
            }
        },
        orderBy: { CreatedAt: 'desc' }
    })
}

export async function deleteUser(userId: number) {
    if (!await isAdmin()) return { error: 'Unauthorized' }

    try {
        // Check if target user is admin
        const targetUserRole = await prisma.userroles.findFirst({
            where: {
                UserID: userId,
                roles: {
                    RoleName: 'Admin'
                }
            }
        })

        if (targetUserRole) {
            return { error: 'Cannot delete admin users' }
        }

        await prisma.users.delete({
            where: { UserID: userId }
        })
        revalidatePath('/admin/users')
        return { success: true }
    } catch (error) {
        console.error('Delete user error:', error)
        return { error: 'Failed to delete user' }
    }
}
