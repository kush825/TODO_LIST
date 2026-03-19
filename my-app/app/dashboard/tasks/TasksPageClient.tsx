'use client'

import { useState } from 'react'
import { ListTodo, ArrowLeft, Search } from 'lucide-react'
import ListView from '@/components/ListView'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface TasksPageClientProps {
    initialTasks: any[]
    activeUserName?: string
    activeUserId?: number
    userRole?: string
}

export default function TasksPageClient({ initialTasks, activeUserName, activeUserId, userRole }: TasksPageClientProps) {
    const [tasks, setTasks] = useState(initialTasks)
    const [searchTerm, setSearchTerm] = useState('')
    const router = useRouter()

    const handleTaskClick = (task: any) => {
        router.push(`/dashboard/project/${task.ProjectID}?taskId=${task.TaskID}`);
    }

    const handleStatusUpdate = async (id: number, status: string) => {
        if (userRole === 'Viewer') {
            toast.error('Viewers cannot update task status');
            return;
        }
        try {
            const response = await fetch('/api/task', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ TaskID: id, Status: status })
            });

            if (!response.ok) throw new Error('Failed to update task');

            setTasks(prev => prev.map(t => t.TaskID === id ? { ...t, Status: status } : t));
            toast.success(`Task marked as ${status.toLowerCase()}`);
        } catch (error) {
            toast.error('Error updating task');
        }
    }

    const filteredTasks = tasks.filter(task =>
        task.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.ProjectName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1 uppercase tracking-wider">
                        <ListTodo className="w-4 h-4" />
                        Task Management
                    </div>
                    <h1 className="text-4xl font-extrabold text-foreground tracking-tight">
                        All Tasks
                    </h1>
                    <p className="text-muted-foreground font-medium">View and manage tasks across all your projects.</p>
                </div>

                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-bold rounded-xl transition-all border border-theme shadow-sm w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </header>

            <div className="flex flex-col gap-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        placeholder="Search tasks or projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-card border border-theme rounded-lg pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                    />
                </div>

                <div className="flex-1">
                    <ListView
                        tasks={filteredTasks}
                        onTaskClick={handleTaskClick}
                        onStatusUpdate={handleStatusUpdate}
                    />
                </div>
            </div>
        </div>
    )
}
