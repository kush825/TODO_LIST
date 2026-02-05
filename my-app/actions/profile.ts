'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function getUserProfile(page: number = 1) {
    const session = await getSession()
    if (!session) return null

    const user = await prisma.users.findUnique({
        where: { UserID: session.userId as number },
        select: {
            UserName: true,
            Email: true,
            // @ts-ignore
            ProfileImage: true
        }
    })

    if (!user) return null

    const projectCount = await prisma.projects.count({
        where: { CreatedBy: session.userId as number }
    })

    const taskCount = await prisma.tasks.count({
        where: { AssignedTo: session.userId as number }
    })

    const completedTaskCount = await prisma.tasks.count({
        where: {
            AssignedTo: session.userId as number,
            Status: 'Done'
        }
    })

    const PAGE_SIZE = 4
    const skip = (page - 1) * PAGE_SIZE

    const [recentActivity, totalActivityCount] = await Promise.all([
        prisma.taskhistory.findMany({
            where: { ChangedBy: session.userId as number },
            orderBy: { ChangeTime: 'desc' },
            take: PAGE_SIZE,
            skip: skip,
            include: {
                tasks: {
                    select: {
                        Title: true,
                        tasklists: {
                            select: {
                                projects: {
                                    select: { ProjectName: true }
                                }
                            }
                        }
                    }
                }
            }
        }),
        prisma.taskhistory.count({
            where: { ChangedBy: session.userId as number }
        })
    ])

    return {
        user,
        stats: {
            projects: projectCount,
            totalTasks: taskCount,
            completedTasks: completedTaskCount,
            pendingTasks: taskCount - completedTaskCount,
            completionRate: taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : 0
        },
        recentActivity,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalActivityCount / PAGE_SIZE),
            hasMore: skip + PAGE_SIZE < totalActivityCount
        }
    }
}

export async function updateUserProfile(formData: FormData) {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    const name = formData.get('name') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!name || name.trim().length === 0) {
        return { error: 'Name is required' }
    }

    // Prepare update data
    const updateData: any = { UserName: name }

    // If password is provided, handle hashing
    if (password) {
        if (password !== confirmPassword) {
            return { error: 'Passwords do not match' }
        }
        if (password.length < 6) {
            return { error: 'Password must be at least 6 characters' }
        }
        updateData.PasswordHash = await bcrypt.hash(password, 10)
    }

    try {
        await prisma.users.update({
            where: { UserID: session.userId as number },
            data: updateData
        })
        revalidatePath('/dashboard/profile')
        return { success: true }
    } catch (error) {
        console.error("Update profile error", error)
        return { error: 'Failed to update profile' }
    }
}

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function uploadProfileImage(formData: FormData) {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    const file = formData.get('file') as File
    if (!file) return { error: 'No file uploaded' }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure directory exists
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'profiles')
    await mkdir(uploadDir, { recursive: true })

    // Create unique filename
    const filename = `${session.userId}-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    const filepath = join(uploadDir, filename)

    try {
        await writeFile(filepath, buffer)

        // Save relative path to DB
        const publicPath = `/uploads/profiles/${filename}`

        await prisma.users.update({
            where: { UserID: session.userId as number },
            // @ts-ignore
            data: { ProfileImage: publicPath }
        })

        revalidatePath('/dashboard/profile')
        return { success: true, imagePath: publicPath }
    } catch (error) {
        console.error("Upload error", error)
        return { error: 'Failed to upload image' }
    }
}

export async function deleteProfileImage() {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    try {
        await prisma.users.update({
            where: { UserID: session.userId as number },
            // @ts-ignore
            data: { ProfileImage: null }
        })

        revalidatePath('/dashboard')
        revalidatePath('/dashboard/profile')
        return { success: true }
    } catch (error) {
        console.error("Delete profile image error", error)
        return { error: 'Failed to delete profile image' }
    }
}
