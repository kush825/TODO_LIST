'use server'

import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getTasks(projectId: number) {
    const session = await getSession()
    if (!session) return []

    // Ensure user owns the project or is assigned? For now, ownership.
    // Actually, tasks are in lists, lists in projects.

    return await prisma.tasks.findMany({
        where: {
            tasklists: {
                ProjectID: projectId
            }
        },
        include: {
            tasklists: true
        },
        orderBy: { CreatedAt: 'desc' }
    })
}

export async function createTask(formData: FormData) {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    const projectId = parseInt(formData.get('projectId') as string)
    const title = formData.get('title') as string
    const status = formData.get('status') as string || 'Pending'
    const priority = formData.get('priority') as string || 'Medium'

    // We need a ListID. If we are using Status as list, we might need to map them.
    // However, the DB has TaskLists.
    // Let's assume for this simple Dashboard (Kanban), we map Status to Lists or we just use Lists.
    // The DB has `TaskLists` table AND `Status` field in `Tasks`.
    // Let's rely on `TaskLists` for the Kanban columns.

    // Check if default lists exist for project, else create.
    const listName = status === 'Pending' ? 'To Do' : status === 'In Progress' ? 'Doing' : 'Done'

    let list = await prisma.tasklists.findFirst({
        where: { ProjectID: projectId, ListName: listName }
    })

    if (!list) {
        list = await prisma.tasklists.create({
            data: { ProjectID: projectId, ListName: listName }
        })
    }

    try {
        const newTask = await prisma.tasks.create({
            data: {
                ListID: list.ListID,
                // ProjectID removed as it is not in valid schema
                // Tasks -> ListID -> ProjectID.
                // So create({ data: { ListID: ... } })
                Title: title,
                Status: status,
                Priority: priority,
                AssignedTo: session.userId as number // Auto assign to creator for now
            }
        })

        await prisma.taskhistory.create({
            data: {
                TaskID: newTask.TaskID,
                ChangedBy: session.userId as number,
                ChangeType: 'CREATED'
            }
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Create task error", error)
        return { error: 'Failed to create task' }
    }
}

export async function updateTaskDetails(taskId: number, data: { title: string, description: string, priority: string }) {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    await prisma.tasks.update({
        where: { TaskID: taskId },
        data: {
            Title: data.title,
            Description: data.description,
            Priority: data.priority
        }
    })

    await prisma.taskhistory.create({
        data: {
            TaskID: taskId,
            ChangedBy: session.userId as number,
            ChangeType: 'UPDATED'
        }
    })
    revalidatePath('/dashboard')
}

export async function deleteTask(taskId: number) {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    await prisma.tasks.delete({
        where: { TaskID: taskId }
    })
    revalidatePath('/dashboard')
}

export async function updateTaskStatus(taskId: number, newStatus: string) {
    // This implies moving to another list potentially.
    // For simplicity, just update status field for now.
    // But if we want Kanban, we should update ListID too.
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    await prisma.tasks.update({
        where: { TaskID: taskId },
        data: { Status: newStatus }
    })

    await prisma.taskhistory.create({
        data: {
            TaskID: taskId,
            ChangedBy: session.userId as number,
            ChangeType: 'UPDATED'
        }
    })
    revalidatePath('/dashboard')
}

export async function getTaskDetails(taskId: number) {
    const session = await getSession()
    if (!session) return null

    return await prisma.tasks.findUnique({
        where: { TaskID: taskId },
        include: {
            taskcomments: {
                include: {
                    users: {
                        select: { UserName: true }
                    }
                },
                orderBy: { CreatedAt: 'desc' }
            },
            taskhistory: {
                include: {
                    users: {
                        select: { UserName: true }
                    }
                },
                orderBy: { ChangeTime: 'desc' }
            }
        }
    })
}

export async function addComment(taskId: number, commentText: string) {
    const session = await getSession()
    if (!session) return { error: 'Unauthorized' }

    try {
        await prisma.taskcomments.create({
            data: {
                TaskID: taskId,
                UserID: session.userId as number,
                CommentText: commentText
            }
        })
        revalidatePath('/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Add comment error", error)
        return { error: 'Failed to add comment' }
    }
}
