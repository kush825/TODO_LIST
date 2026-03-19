'use client'

import { useState } from 'react'
import { Calendar as CalendarIcon, LayoutDashboard, Search } from 'lucide-react'
import CalendarView from '@/components/CalendarView'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type GlobalTask = {
    TaskID: number
    Title: string
    Description?: string | null
    Status?: string | null
    Priority?: string | null
    DueDate?: Date | null
    CreatedAt?: Date | null
    ListID: number
    ProjectID: number
    ProjectName: string
    AssignedToName: string
}

interface CalendarPageClientProps {
    initialTasks: any[]
    activeUserName?: string
    activeUserId?: number
}

export default function CalendarPageClient({ initialTasks, activeUserName, activeUserId }: CalendarPageClientProps) {
    const [tasks, setTasks] = useState<GlobalTask[]>(initialTasks as GlobalTask[])
    const router = useRouter()

    const handleTaskClick = (task: any) => {
        router.push(`/dashboard/project/${task.ProjectID}?taskId=${task.TaskID}`);
    }

    const handleCreateTask = async (date: Date, title: string) => {
        try {
            const res = await fetch('/api/tasklist');
            const lists: any[] = await res.json();

            if (!lists || lists.length === 0) {
                toast.error('Please create a project first');
                return;
            }

            const targetList = lists[0];

            const response = await fetch('/api/task', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    Title: title,
                    DueDate: date,
                    ListID: targetList.ListID,
                    Status: 'Pending',
                    Priority: 'Medium',
                    AssignedTo: activeUserId
                })
            });

            if (!response.ok) throw new Error('Failed to create task');

            const newTask = await response.json();
            toast.success('Task created');

            setTasks(prev => [...prev, {
                ...newTask,
                ProjectName: targetList.projects?.ProjectName || 'Project',
                AssignedToName: 'Unassigned',
                ProjectID: targetList.ProjectID,
                ListID: targetList.ListID
            }]);
            router.refresh();
        } catch (error) {
            toast.error('Error creating task');
        }
    }

    return (
        <div className="h-full flex flex-col p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
                        <CalendarIcon className="w-8 h-8 text-primary" />
                        Global Calendar
                    </h1>
                    <p className="text-muted-foreground font-medium">Manage all your tasks across all projects.</p>
                </div>
            </header>

            <div className="flex-1 min-h-[600px]">
                <CalendarView
                    tasks={tasks}
                    onTaskClick={handleTaskClick}
                    onCreateTask={handleCreateTask}
                    currentUserName={activeUserName}
                />
            </div>
        </div>
    )
}
