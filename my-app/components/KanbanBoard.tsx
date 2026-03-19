'use client'

import { useState, useEffect, useId, useRef } from 'react'
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
    useDroppable,
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
import { Plus, MoreHorizontal, Calendar, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type Task = {
    TaskID: number
    Title: string
    Description?: string | null
    Status?: string | null
    Priority?: string | null
    DueDate?: Date | null
    CreatedAt?: Date | null
}

const COLUMNS = [
    { id: 'Pending', title: 'To Do', color: 'bg-slate-500' },
    { id: 'In Progress', title: 'In Progress', color: 'bg-blue-500' },
    { id: 'Completed', title: 'Completed', color: 'bg-emerald-500' },
]

export default function KanbanBoard({
    projectId,
    listId,
    tasks,
    setTasks,
    onTaskClick,
    userRole
}: {
    projectId: number,
    listId: number,
    tasks: Task[],
    setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
    onTaskClick: (task: Task) => void,
    userRole?: string
}) {
    const isViewer = userRole === 'Viewer'
    const [activeId, setActiveId] = useState<number | null>(null)
    const [mounted, setMounted] = useState(false)
    const dndContextId = useId()
    const router = useRouter()
    const suppressClickRef = useRef(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    function handleDragOver(event: DragOverEvent) {
        if (isViewer) return
        const { active, over } = event
        if (!over) return

        const activeId = active.id as number
        const overId = over.id

        const activeTask = tasks.find((t) => t.TaskID === activeId)
        if (!activeTask) return

        let newStatus = ''
        if (COLUMNS.find(c => c.id === overId)) {
            newStatus = overId as string
        } else {
            const overTask = tasks.find(t => t.TaskID === overId)
            newStatus = overTask?.Status || ''
        }

        if (newStatus && activeTask.Status !== newStatus) {
            setTasks((tasks) => {
                return tasks.map(t => {
                    if (t.TaskID === activeId) {
                        return { ...t, Status: newStatus }
                    }
                    return t
                })
            })
        }
    }

    async function handleDragEnd(event: DragEndEvent) {
        if (isViewer) {
            setActiveId(null)
            return
        }
        const { active, over } = event
        const activeId = active.id as number
        const overId = over?.id

        if (!overId) {
            setActiveId(null)
            return
        }

        const activeTask = tasks.find((t) => t.TaskID === activeId)
        if (!activeTask) {
            setActiveId(null)
            return
        }

        try {
            const response = await fetch(`/api/task/${activeId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ Status: activeTask.Status })
            });

            if (!response.ok) throw new Error('Failed to update status');
            router.refresh();
        } catch (error) {
            toast.error('Failed to update task status');
        }

        setActiveId(null)
        setTimeout(() => {
            suppressClickRef.current = false
        }, 100)
    }

    const handleTaskClick = (task: Task) => {
        if (suppressClickRef.current) return
        onTaskClick(task)
    }

    if (!mounted) return null

    return (
        <DndContext
            id={dndContextId}
            sensors={isViewer ? [] : sensors}
            collisionDetection={closestCorners}
            onDragStart={(event) => {
                if (!isViewer) {
                    suppressClickRef.current = true
                    setActiveId(event.active.id as number)
                }
            }}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={() => {
                setActiveId(null)
                setTimeout(() => {
                    suppressClickRef.current = false
                }, 100)
            }}
        >
            <div className="flex h-full gap-6">
                {COLUMNS.map((col) => (
                    <Column
                        key={col.id}
                        col={col}
                        tasks={tasks.filter((t) => (t.Status || 'Pending') === col.id)}
                        projectId={projectId}
                        onTaskClick={handleTaskClick}
                        suppressClickRef={suppressClickRef}
                        isViewer={isViewer}
                        onTaskCreate={async (title) => {
                            if (isViewer) {
                                toast.error('Viewers cannot create tasks');
                                return;
                            }
                            try {
                                const response = await fetch('/api/task', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        ListID: listId,
                                        Title: title,
                                        Status: col.id,
                                        Priority: 'Medium'
                                    })
                                });

                                if (!response.ok) throw new Error('Failed to create task');

                                const newTask = await response.json();
                                if (newTask) {
                                    setTasks(prev => [newTask, ...prev]);
                                    toast.success('Task created');
                                }
                                router.refresh();
                            } catch (e) {
                                toast.error('Failed to create task');
                            }
                        }}
                    />
                ))}
            </div>
            <DragOverlay dropAnimation={null}>
                {activeId ? (
                    <div className="opacity-90 shadow-2xl scale-105 pointer-events-none">
                        <TaskCard task={tasks.find((t) => t.TaskID === activeId)!} isOverlay />
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    )
}

function Column({ col, tasks, projectId, onTaskCreate, onTaskClick, isViewer, suppressClickRef }: {
    col: any,
    tasks: Task[],
    projectId: number,
    onTaskCreate: (t: string) => void,
    onTaskClick: (t: Task) => void,
    isViewer: boolean,
    suppressClickRef: React.MutableRefObject<boolean>
}) {
    const [isCreating, setIsCreating] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const { setNodeRef } = useDroppable({
        id: col.id,
    })

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

            <div ref={setNodeRef} className="flex-1 overflow-y-auto p-3 space-y-3">
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
                ) : !isViewer && (
                    <button
                        onClick={() => {
                            if (suppressClickRef.current) return
                            setIsCreating(true)
                        }}
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
        transform: CSS.Translate.toString(transform),
        transition,
    }

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="h-[100px] w-full rounded-lg bg-muted border border-primary/50 opacity-50"
            />
        )
    }

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} onClick={onClick}>
            <TaskCard task={task} />
        </div>
    )
}

function TaskCard({ task, isOverlay }: { task: Task, isOverlay?: boolean }) {
    return (
        <div className={cn(
            "group relative bg-card hover:bg-muted/30 border border-theme hover:border-primary/30 rounded-lg p-3 shadow-sm",
            !isOverlay && "cursor-grab active:cursor-grabbing transition-[background-color,border-color,box-shadow] duration-200 hover:shadow-md",
            isOverlay && "shadow-xl border-primary bg-muted/60"
        )}>
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
            <div className="flex flex-col gap-2 mt-3">
                {task.DueDate && (
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>Due: {new Date(task.DueDate).toLocaleDateString()}</span>
                    </div>
                )}
                <div className="flex items-center justify-between text-[9px] text-muted-foreground/60">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-2.5 w-2.5" />
                        <span>Created: {task.CreatedAt ? new Date(task.CreatedAt).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }) : 'N/A'}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
