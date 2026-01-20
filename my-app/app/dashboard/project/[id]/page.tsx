import { getTasks } from '@/actions/tasks'
import { getProjects } from '@/actions/projects' // helper to get single project name?
import { prisma } from '@/lib/prisma'
import KanbanBoard from '@/components/KanbanBoard'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
    // Await the params since Next.js 15+ (or recent 14 changes) might treat params as promise
    // Actually in standard 14, params is an object. check user next version. 16.1.1. In 15/16 params is a promise.
    // Wait, package.json says "next": "16.1.1". So YES, params is a Promise.

    const { id } = await params
    const projectId = parseInt(id)
    if (isNaN(projectId)) redirect('/dashboard')

    const session = await getSession()
    if (!session) redirect('/auth/login')

    const project = await prisma.projects.findUnique({
        where: { ProjectID: projectId },
    })

    if (!project) redirect('/dashboard')

    const tasks = await getTasks(projectId)

    return (
        <div className="h-full flex flex-col p-6">
            <header className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-1">{project.ProjectName}</h1>
                    <p className="text-slate-400 text-sm">{project.Description}</p>
                </div>
            </header>

            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <KanbanBoard projectId={projectId} initialTasks={tasks} />
            </div>
        </div>
    )
}
