'use client'

import { useState, useEffect, useId } from 'react'
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core'
import { toast } from 'sonner'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { createTask, updateTaskStatus, updateTaskDetails, deleteTask } from '@/actions/tasks'
import { Plus, MoreHorizontal, Calendar, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import TaskModal from './TaskModal'
import DeleteConfirmModal from './DeleteConfirmModal'
import { useRouter } from 'next/navigation'

type Task = {
    TaskID: number
    Title: string
    Description?: string | null
    Status?: string | null
    Priority?: string | null
    DueDate?: Date | null
}

const COLUMNS = [
    { id: 'Pending', title: 'To Do', color: 'bg-slate-500' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'Completed', title: 'Done', color: 'bg-emerald-500' },
]

export default function KanbanBoard({ projectId, initialTasks }: { projectId: number, initialTasks: any[] }) {
    const [tasks, setTasks] = useState<Task[]>(initialTasks)
    const [activeId, setActiveId] = useState<number | null>(null)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)
    const [loading, setLoading] = useState(false)
    const [mounted, setMounted] = useState(false)
    const dndContextId = useId()
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event
        const activeId = active.id as number
        const overId = over?.id

        if (!overId) return

        const activeTask = tasks.find((t) => t.TaskID === activeId)
        let newStatus = ''

        if (COLUMNS.find(c => c.id === overId)) {
            newStatus = overId as string
        } else {
            const overTask = tasks.find(t => t.TaskID === overId)
            newStatus = overTask?.Status || 'Pending'
        }

        if (activeTask && activeTask.Status !== newStatus) {
            setTasks((tasks) => {
                return tasks.map(t => {
                    if (t.TaskID === activeId) {
                        return { ...t, Status: newStatus }
                    }
                    return t
                })
            })
            await updateTaskStatus(activeId, newStatus)
        }
        setActiveId(null)
    }

    if (!mounted) return null

    return (
        <DndContext
            id={dndContextId}
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={(event) => setActiveId(event.active.id as number)}
            onDragEnd={handleDragEnd}
        >
            <div className="flex h-full gap-6">
                {COLUMNS.map((col) => (
                    <Column
                        key={col.id}
                        col={col}
                        tasks={tasks.filter((t) => (t.Status || 'Pending') === col.id)}
                        projectId={projectId}
                        onTaskClick={(task) => setEditingTask(task)}
                        onTaskCreate={async (title) => {
                            const formData = new FormData()
                            formData.append('projectId', projectId.toString())
                            formData.append('title', title)
                            formData.append('status', col.id)
                            try {
                                await createTask(formData)
                                toast.success('Task created')
                                window.location.reload()
                            } catch (e) {
                                toast.error('Failed to create task')
                            }
                        }}
                    />
                ))}
            </div>
            <DragOverlay>
                {activeId ? <TaskCard task={tasks.find((t) => t.TaskID === activeId)!} /> : null}
            </DragOverlay>

            {editingTask && (
                <TaskModal
                    task={editingTask}
                    onClose={() => setEditingTask(null)}
                    onUpdate={async (id, data) => {
                        try {
                            await updateTaskDetails(id, data)
                            toast.success('Task updated')
                            window.location.reload()
                        } catch (e) {
                            toast.error('Failed to update task')
                        }
                    }}
                    onDelete={async (id) => {
                        setDeletingTaskId(id)
                    }}
                />
            )}

            <DeleteConfirmModal
                isOpen={!!deletingTaskId}
                onClose={() => setDeletingTaskId(null)}
                onConfirm={async () => {
                    if (!deletingTaskId) return
                    setLoading(true)
                    try {
                        await deleteTask(deletingTaskId)
                        setTasks(prev => prev.filter(t => t.TaskID !== deletingTaskId))
                        toast.success('Task deleted successfully')
                        setDeletingTaskId(null)
                        setEditingTask(null)
                    } catch (e) {
                        toast.error('Failed to delete task')
                    } finally {
                        setLoading(false)
                    }
                }}
                loading={loading}
                title="Delete Task"
                message="Are you sure you want to delete this task? This action cannot be undone."
            />
        </DndContext>
    )
}

function Column({ col, tasks, projectId, onTaskCreate, onTaskClick }: { col: any, tasks: Task[], projectId: number, onTaskCreate: (t: string) => void, onTaskClick: (t: Task) => void }) {
    const [isCreating, setIsCreating] = useState(false)
    const [newTitle, setNewTitle] = useState('')

    return (
        <div className="flex h-full w-80 flex-col rounded-xl bg-card border border-theme shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-theme/50">
                <div className="flex items-center gap-2">
                    <div className={cn("h-2 w-2 rounded-full", col.color)} />
                    <h3 className="font-semibold text-foreground/80">{col.title}</h3>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground font-mono">
                        {tasks.length}
                    </span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
                <SortableContext items={tasks.map(t => t.TaskID)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <SortableTask key={task.TaskID} task={task} onClick={() => onTaskClick(task)} />
                    ))}
                </SortableContext>

                {isCreating ? (
                    <div className="p-3 bg-muted/50 rounded-lg border border-primary/50 animate-in fade-in zoom-in-95 duration-200">
                        <input
                            autoFocus
                            className="w-full bg-transparent text-sm text-foreground placeholder-muted-foreground/50 outline-none mb-2"
                            placeholder="Task title..."
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newTitle.trim()) {
                                    onTaskCreate(newTitle)
                                    setNewTitle('')
                                    setIsCreating(false)
                                }
                                if (e.key === 'Escape') {
                                    setIsCreating(false)
                                }
                            }}
                            onBlur={() => {
                                if (!newTitle.trim()) setIsCreating(false)
                            }}
                        />
                        <div className="flex justify-end gap-2 text-xs">
                            <button className="text-muted-foreground hover:text-foreground" onClick={() => setIsCreating(false)}>Cancel</button>
                            <button
                                className="text-primary hover:text-primary-hover font-medium"
                                onClick={() => {
                                    if (newTitle.trim()) {
                                        onTaskCreate(newTitle)
                                        setNewTitle('')
                                        setIsCreating(false)
                                    }
                                }}>Add</button>
                        </div>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="w-full py-2 flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg border border-dashed border-theme transition-all"
                    >
                        <Plus className="h-4 w-4" />
                        Add Task
                    </button>
                )}
            </div>
        </div>
    )
}

function SortableTask({ task, onClick }: { task: Task, onClick?: () => void }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: task.TaskID })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="h-[100px] rounded-lg bg-muted border border-primary/50 opacity-50"
            />
        )
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}>
            <TaskCard task={task} />
        </div>
    )
}

function TaskCard({ task }: { task: Task }) {
    return (
        <div className="group relative bg-card hover:bg-muted/30 border border-theme hover:border-primary/30 rounded-lg p-3 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-2">
                <span className={cn(
                    "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
                    task.Priority === 'High' ? "bg-red-500/10 text-red-500 dark:text-red-400" :
                        task.Priority === 'Medium' ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400" :
                            "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                )}>
                    {task.Priority || 'Low'}
                </span>
                <button className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-primary transition-opacity">
                    <MoreHorizontal className="h-3 w-3" />
                </button>
            </div>
            <h4 className="text-sm font-semibold text-foreground mb-1 leading-tight line-clamp-2">{task.Title}</h4>
            <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                {task.DueDate && (
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(task.DueDate).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
