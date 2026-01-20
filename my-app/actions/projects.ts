'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getProjects() {
    const session = await getSession()
    if (!session?.userId) return []

    return await prisma.projects.findMany({
        where: { CreatedBy: session.userId },
        orderBy: { CreatedAt: 'desc' },
    })
}

export async function createProject(formData: FormData) {
    const session = await getSession()
    if (!session?.userId) return { error: 'Unauthorized' }

    const projectName = formData.get('projectName') as string
    const description = formData.get('description') as string

    if (!projectName) return { error: 'Project name is required' }

    try {
        const project = await prisma.projects.create({
            data: {
                ProjectName: projectName,
                Description: description,
                CreatedBy: session.userId,
            },
        })

        // Create a default TaskList "To Do"
        await prisma.tasklists.create({
            data: {
                ProjectID: project.ProjectID,
                ListName: 'To Do'
            }
        })

        revalidatePath('/dashboard')
        return { success: true, project }
    } catch (error) {
        console.error('Create Project Error:', error)
        return { error: 'Failed to create project' }
    }
}

export async function deleteProject(projectId: number) {
    const session = await getSession()
    if (!session?.userId) return { error: 'Unauthorized' }

    await prisma.projects.delete({
        where: { ProjectID: projectId }
    })
    revalidatePath('/dashboard')
}

export async function updateProject(projectId: number, newName: string) {
    const session = await getSession()
    if (!session?.userId) return { error: 'Unauthorized' }

    if (!newName.trim()) return { error: 'Project name cannot be empty' }

    await prisma.projects.update({
        where: { ProjectID: projectId },
        data: { ProjectName: newName }
    })
    revalidatePath('/dashboard')
}
