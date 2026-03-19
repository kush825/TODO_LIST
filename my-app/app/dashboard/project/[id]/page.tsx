import { prisma } from '@/lib/prisma'
import ProjectViewManager from '@/components/ProjectViewManager'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) redirect('/dashboard')

    const session = await getSession()
    if (!session) redirect('/auth/login')

    const project = await prisma.projects.findUnique({
        where: { ProjectID: projectId },
    })

    if (!project) redirect('/dashboard')

    const tasks = await prisma.tasks.findMany({
        where: {
            tasklists: {
                ProjectID: projectId
            }
        },
        include: {
            tasklists: true,
            users: {
                select: {
                    UserName: true
                }
            }
        },
        orderBy: { CreatedAt: 'desc' }
    })

    let taskList = await prisma.tasklists.findFirst({
        where: { ProjectID: projectId }
    })

    if (!taskList) {
        taskList = await prisma.tasklists.create({
            data: {
                ListName: 'Default List',
                projects: {
                    connect: {
                        ProjectID: projectId
                    }
                }
            }
        })
    }

    return (
        <div className="h-full flex flex-col p-6 overflow-hidden">
            <div className="flex-1 overflow-hidden">
                <ProjectViewManager
                    project={project}
                    listId={taskList.ListID}
                    userRole={session.role}
                    initialTasks={tasks.map(t => ({
                        ...t,
                        DueDate: t.DueDate || null,
                        CreatedAt: t.CreatedAt || null,
                        ProjectName: project.ProjectName,
                        AssignedToName: t.users?.UserName || 'Unassigned',
                        UpdatedAt: t.UpdatedAt
                    }))}
                />
            </div>
        </div>
    )
}
