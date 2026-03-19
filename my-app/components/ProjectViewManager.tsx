'use client'

import { useState, useEffect } from 'react'
import { LayoutGrid, List as ListIcon, Clock, CirclePlay, CircleCheckBig, LayoutDashboard, Calendar, MoreHorizontal, CircleCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import KanbanBoard from './KanbanBoard'
import ListView from './ListView'
import CalendarView from './CalendarView'
import SummaryView from './SummaryView'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'
import TaskModal from './TaskModal'
import DeleteConfirmModal from './DeleteConfirmModal'

type Task = {
    TaskID: number
    Title: string
    Description?: string | null
    Status?: string | null
    Priority?: string | null
    DueDate?: Date | null
    CreatedAt?: Date | null
    UpdatedAt?: Date | null
    ProjectName?: string
    AssignedToName?: string
}

type Project = {
    ProjectID: number
    ProjectName: string
    Description?: string | null
    Background?: string | null
}

export default function ProjectViewManager({
    project,
    listId,
    initialTasks,
    userRole
}: {
    project: Project,
    listId: number,
    initialTasks: Task[],
    userRole?: string
}) {
    const [view, setView] = useState<'summary' | 'board' | 'list' | 'calendar'>('summary')
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [currentProject, setCurrentProject] = useState<Project>(project)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [showBackgroundPicker, setShowBackgroundPicker] = useState(false)
    const [activeBackground, setActiveBackground] = useState(project.Background || '')
    const [userUploads, setUserUploads] = useState<string[]>([])

    const isViewer = userRole === 'Viewer'
    const isAdminOrManager = userRole === 'Admin' || userRole === 'ProjectManager'

    const router = useRouter()
    const searchParams = useSearchParams()

    useEffect(() => {
        setTasks(initialTasks)
    }, [initialTasks])

    useEffect(() => {
        if (showBackgroundPicker) {
            fetch('/api/user/uploads')
                .then(res => {
                    if (res.ok) return res.json()
                    return { uploads: [] }
                })
                .then(data => setUserUploads(data.uploads || []))
                .catch(() => setUserUploads([]))
        }
    }, [showBackgroundPicker])

    useEffect(() => {
        setCurrentProject(project)
        setActiveBackground(project.Background || '')
    }, [project])

    useEffect(() => {
        const taskIdParam = searchParams.get('taskId')
        if (taskIdParam) {
            const taskId = parseInt(taskIdParam)
            const task = tasks.find(t => t.TaskID === taskId)
            if (task) {
                setEditingTask(task)
            }
        }
    }, [searchParams, tasks])

    const stats = {
        total: tasks.length,
        pending: tasks.filter(t => (t.Status || 'Pending') === 'Pending').length,
        inProgress: tasks.filter(t => t.Status === 'In Progress').length,
        completed: tasks.filter(t => t.Status === 'Completed').length
    }

    const handleUpdateProject = async (data: Partial<Project>) => {
        if (!isAdminOrManager) {
            toast.error('Only Admins and Managers can update project settings');
            return;
        }
        try {
            const response = await fetch(`/api/project/${project.ProjectID}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to update project');

            const updatedProject = await response.json();
            setCurrentProject(updatedProject);
            setActiveBackground(updatedProject.Background || '');
            toast.success('Project updated');
            router.refresh();
        } catch (e) {
            toast.error('Failed to update project');
        }
    }

    const handleTaskUpdate = async (id: number, data: any) => {
        if (isViewer) {
            toast.error('Viewers cannot update tasks');
            return;
        }
        try {
            const response = await fetch(`/api/task/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to update task');

            const updatedTask = await response.json();
            setTasks(prev => prev.map(t => t.TaskID === id ? updatedTask : t));
            toast.success('Task updated');
            router.refresh();
        } catch (e) {
            toast.error('Failed to update task');
        }
    }

    const handleTaskDelete = async () => {
        if (isViewer) {
            toast.error('Viewers cannot delete tasks');
            return;
        }
        if (!deletingTaskId) return
        setLoading(true)
        try {
            const response = await fetch(`/api/task/${deletingTaskId}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete task');

            setTasks(prev => prev.filter(t => t.TaskID !== deletingTaskId))
            toast.success('Task deleted successfully')
            setDeletingTaskId(null)
            setEditingTask(null)
            router.refresh();
        } catch (e) {
            toast.error('Failed to delete task')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="h-full flex flex-col space-y-6 relative">
            {/* Background Layer */}
            {activeBackground && (
                <div
                    className="absolute inset-0 -z-10 rounded-xl pointer-events-none transition-all duration-500"
                    style={{
                        background: activeBackground.startsWith('http') || activeBackground.startsWith('/')
                            ? `url(${activeBackground}) center/cover no-repeat`
                            : activeBackground
                    }}
                />
            )}

            <header className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-foreground mb-1">{currentProject.ProjectName}</h1>
                    <p className="text-muted-foreground text-sm font-medium">{currentProject.Description}</p>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                        className="p-2 hover:bg-muted/20 rounded-lg transition-colors"
                    >
                        <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
                    </button>

                    {isSettingsOpen && (
                        <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-theme rounded-lg shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
                            <button
                                onClick={() => {
                                    setShowBackgroundPicker(true);
                                    setIsSettingsOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 transition-colors flex items-center gap-2 text-primary font-medium"
                            >
                                <div className="w-4 h-4 rounded bg-gradient-to-br from-indigo-500 to-purple-500" />
                                Set space background
                            </button>
                        </div>
                    )}
                </div>
            </header>

            {showBackgroundPicker && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowBackgroundPicker(false)}>
                    <div className="bg-card w-[400px] border border-theme rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-theme flex items-center justify-between">
                            <h3 className="font-bold text-sm">Space background</h3>
                            <button onClick={() => setShowBackgroundPicker(false)} className="text-muted-foreground hover:text-foreground">✕</button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Your Uploads</label>
                                <div className="grid grid-cols-4 gap-2">
                                    <label className="h-16 rounded-md border border-dashed border-theme hover:border-primary hover:bg-muted/10 cursor-pointer flex flex-col items-center justify-center gap-1 transition-all">
                                        <input
                                            type="file"
                                            accept="image/*,.gif"
                                            className="hidden"
                                            onChange={async (e) => {
                                                const file = e.target.files?.[0];
                                                if (!file) return;

                                                const formData = new FormData();
                                                formData.append('file', file);

                                                try {
                                                    const toastId = toast.loading('Uploading image...');
                                                    const res = await fetch('/api/upload', {
                                                        method: 'POST',
                                                        body: formData
                                                    });

                                                    if (!res.ok) throw new Error('Upload failed');

                                                    const data = await res.json();
                                                    handleUpdateProject({ Background: data.url });
                                                    toast.dismiss(toastId);
                                                    // Refresh uploads
                                                    const uploadsRes = await fetch('/api/user/uploads');
                                                    const uploadsData = await uploadsRes.json();
                                                    setUserUploads(uploadsData.uploads || []);
                                                } catch (err) {
                                                    toast.error('Failed to upload image');
                                                }
                                            }}
                                        />
                                        <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                                            <span className="text-xs font-bold">+</span>
                                        </div>
                                        <span className="text-[9px] font-bold text-muted-foreground uppercase">Upload</span>
                                    </label>

                                    {userUploads.map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleUpdateProject({ Background: url })}
                                            className="h-16 rounded-md overflow-hidden border border-theme/50 hover:border-primary transition-all relative group"
                                        >
                                            <img src={url} className="w-full h-full object-cover" alt="User Upload" />
                                            {activeBackground === url && <div className="absolute inset-0 bg-primary/40 flex items-center justify-center"><CircleCheckBig className="w-4 h-4 text-white" /></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Unsplash Photos</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=400&h=250&fit=crop',
                                        'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&h=250&fit=crop',
                                        'https://images.unsplash.com/photo-1464802686167-b939a6910659?w=400&h=250&fit=crop',
                                        'https://images.unsplash.com/photo-1506318137071-a8bcbf6755dd?w=400&h=250&fit=crop'
                                    ].map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleUpdateProject({ Background: url })}
                                            className="h-16 rounded-md overflow-hidden border border-theme/50 hover:border-primary transition-all relative group"
                                        >
                                            <img src={url} className="w-full h-full object-cover" alt="Background" />
                                            {activeBackground === url && <div className="absolute inset-0 bg-primary/40 flex items-center justify-center"><CircleCheckBig className="w-4 h-4 text-white" /></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-muted-foreground uppercase">Gradients & Colors</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {[
                                        'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
                                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        'linear-gradient(to top, #30cfd0 0%, #330867 100%)',
                                        'linear-gradient(to right, #b8cbb8 0%, #b8cbb8 0%, #b465da 0%, #cf6cc9 33%, #ee609c 66%, #ee609c 100%)',
                                        'linear-gradient(to top, #5f72bd 0%, #9b23ea 100%)',
                                    ].map((grad, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleUpdateProject({ Background: grad })}
                                            className="h-10 rounded-md border border-theme/50 hover:border-primary transition-all relative"
                                            style={{ background: grad }}
                                        >
                                            {activeBackground === grad && <div className="absolute inset-0 flex items-center justify-center"><CircleCheckBig className="w-3 h-3 text-white drop-shadow-md" /></div>}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => handleUpdateProject({ Background: null })}
                                        className="h-10 rounded-md border border-theme bg-card flex items-center justify-center text-[10px] text-muted-foreground hover:text-foreground hover:border-primary transition-all"
                                    >
                                        None
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 shrink-0">
                <div className="bg-card border border-theme p-4 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <LayoutDashboard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Tasks</p>
                        <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    </div>
                </div>
                <div className="bg-card border border-theme p-4 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-slate-500/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-slate-500" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To Do</p>
                        <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                    </div>
                </div>
                <div className="bg-card border border-theme p-4 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <CirclePlay className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">In Progress</p>
                        <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
                    </div>
                </div>
                <div className="bg-card border border-theme p-4 rounded-xl shadow-sm flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <CircleCheckBig className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed</p>
                        <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-lg w-fit border border-theme shrink-0">
                <button
                    onClick={() => setView('summary')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                        view === 'summary'
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                >
                    <LayoutDashboard className="h-4 w-4" />
                    Summary
                </button>
                <button
                    onClick={() => setView('board')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                        view === 'board'
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                >
                    <LayoutGrid className="h-4 w-4" />
                    Board
                </button>
                <button
                    onClick={() => setView('list')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                        view === 'list'
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                >
                    <ListIcon className="h-4 w-4" />
                    List
                </button>
                <button
                    onClick={() => setView('calendar')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                        view === 'calendar'
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    )}
                >
                    <Calendar className="h-4 w-4" />
                    Calendar
                </button>
            </div>

            <div className="flex-1 overflow-auto min-h-0">
                {view === 'summary' ? (
                    <SummaryView tasks={tasks} />
                ) : view === 'board' ? (
                    <KanbanBoard
                        projectId={project.ProjectID}
                        listId={listId}
                        tasks={tasks}
                        setTasks={setTasks}
                        onTaskClick={(task) => setEditingTask(task)}
                        userRole={userRole}
                    />
                ) : view === 'list' ? (
                    <ListView
                        tasks={tasks}
                        onTaskClick={(task) => setEditingTask(task)}
                        onStatusUpdate={(id, status) => handleTaskUpdate(id, { Status: status })}
                    />
                ) : (
                    <CalendarView
                        tasks={tasks}
                        onTaskClick={(task) => setEditingTask(task)}
                        onCreateTask={async (date, title) => {
                            try {
                                const response = await fetch('/api/task', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        Title: title,
                                        DueDate: date,
                                        ListID: listId,
                                        Status: 'Pending',
                                        Priority: 'Medium'
                                    })
                                });
                                if (!response.ok) throw new Error();
                                const newTask = await response.json();
                                setTasks(prev => [...prev, { ...newTask, AssignedToName: 'Unassigned' }]);
                                toast.success('Task created');
                                router.refresh();
                            } catch (e) {
                                toast.error('Failed to create task');
                            }
                        }}
                    />
                )}
            </div>

            {editingTask && (
                <TaskModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onUpdate={handleTaskUpdate}
                    onDelete={async (id) => { setDeletingTaskId(id) }}
                />
            )}

            <DeleteConfirmModal
                isOpen={!!deletingTaskId}
                onClose={() => setDeletingTaskId(null)}
                onConfirm={handleTaskDelete}
                loading={loading}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
            />
        </div>
    )
}
