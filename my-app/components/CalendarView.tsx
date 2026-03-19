'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Search, User, Zap, Square, CheckSquare, Plus, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

type Task = {
    TaskID: number
    Title: string
    Description?: string | null
    Status?: string | null
    Priority?: string | null
    DueDate?: Date | null
    CreatedAt?: Date | null
    ProjectID?: number
    ProjectName?: string
    AssignedToName?: string
}

interface CalendarViewProps {
    tasks: Task[]
    onTaskClick: (task: Task) => void
    onCreateTask?: (date: Date, title: string) => Promise<void>
    currentUserName?: string
}

export default function CalendarView({
    tasks,
    onTaskClick,
    onCreateTask,
    currentUserName
}: CalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<'month' | 'week'>('month')
    const [quickCreateDate, setQuickCreateDate] = useState<number | null>(null)
    const [quickTitle, setQuickTitle] = useState('')
    const [isCreating, setIsCreating] = useState(false)

    // Filter states
    const [searchTerm, setSearchTerm] = useState('')
    const [assigneeFilter, setAssigneeFilter] = useState(currentUserName || 'All')
    const [statusFilter, setStatusFilter] = useState('All')
    const [priorityFilter, setPriorityFilter] = useState('All')

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const handlePrev = () => {
        if (view === 'month') {
            setCurrentDate(new Date(year, month - 1, 1))
        } else {
            const prevWeek = new Date(currentDate)
            prevWeek.setDate(currentDate.getDate() - 7)
            setCurrentDate(prevWeek)
        }
    }

    const handleNext = () => {
        if (view === 'month') {
            setCurrentDate(new Date(year, month + 1, 1))
        } else {
            const nextWeek = new Date(currentDate)
            nextWeek.setDate(currentDate.getDate() + 7)
            setCurrentDate(nextWeek)
        }
    }

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    const filteredTasks = tasks.filter(task => {
        const matchSearch = searchTerm === '' || task.Title.toLowerCase().includes(searchTerm.toLowerCase())
        const matchAssignee = assigneeFilter === 'All' || task.AssignedToName === assigneeFilter
        const matchStatus = statusFilter === 'All' || task.Status === statusFilter
        const matchPriority = priorityFilter === 'All' || task.Priority === priorityFilter
        return matchSearch && matchAssignee && matchStatus && matchPriority
    })

    const getTasksForDay = (date: Date) => {
        return filteredTasks.filter(task => {
            if (!task.DueDate) return false
            const dueDate = new Date(task.DueDate)
            return dueDate.getFullYear() === date.getFullYear() &&
                dueDate.getMonth() === date.getMonth() &&
                dueDate.getDate() === date.getDate()
        })
    }

    const handleCreate = async (date: Date) => {
        if (!quickTitle.trim() || !onCreateTask) return
        setIsCreating(true)
        // Normalize to noon local time to prevent timezone-related day shifts during JSON serialization
        const normalizedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0)
        await onCreateTask(normalizedDate, quickTitle)
        setQuickTitle('')
        setQuickCreateDate(null)
        setIsCreating(false)
    }

    const today = new Date()
    const isSameDay = (date1: Date, date2: Date) => {
        return date1.getFullYear() === date2.getFullYear() &&
            date1.getMonth() === date2.getMonth() &&
            date1.getDate() === date2.getDate()
    }

    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()
    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()

    const getMonthDays = () => {
        const days = []
        const numDays = daysInMonth(year, month)
        const firstDay = firstDayOfMonth(year, month)
        for (let i = 0; i < firstDay; i++) days.push(null)
        for (let i = 1; i <= numDays; i++) {
            days.push(new Date(year, month, i))
        }
        return days
    }

    const getWeekDays = () => {
        const days = []
        const current = new Date(currentDate)
        const dayOfWeek = current.getDay()
        const diff = current.getDate() - dayOfWeek
        const startOfWeek = new Date(current.setDate(diff))

        for (let i = 0; i < 7; i++) {
            const day = new Date(startOfWeek)
            day.setDate(startOfWeek.getDate() + i)
            days.push(day)
        }
        return days
    }

    const calendarContent = view === 'month' ? getMonthDays() : getWeekDays()

    return (
        <div className="flex flex-col h-full bg-card/60 backdrop-blur-xl border border-theme rounded-2xl overflow-hidden shadow-2xl">
            {/* Jira Style Action Bar */}
            <div className="flex flex-col gap-4 p-6 border-b border-theme bg-muted/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <span>Spaces</span>
                            <span className="opacity-50">/</span>
                            <span className="text-foreground font-bold flex items-center gap-2">
                                <div className="p-1 bg-amber-500 rounded text-[10px] shadow-sm">🗓️</div>
                                Calendar View
                            </span>
                        </div>
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground hover:text-foreground cursor-pointer" />
                    </div>

                    <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-theme">
                        <button onClick={handlePrev} className="p-1.5 hover:bg-white/5 rounded transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="px-4 text-sm font-bold min-w-[140px] text-center">
                            {view === 'month' ? `${monthNames[month]} ${year}` : `Week of ${getWeekDays()[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                        </span>
                        <button onClick={handleNext} className="p-1.5 hover:bg-white/5 rounded transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        <div className="w-px h-4 bg-theme mx-2" />
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-bold hover:bg-white/5 rounded transition-colors uppercase tracking-tight">Today</button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                        <input
                            placeholder="Search calendar"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-card border border-theme rounded-md pl-9 pr-3 py-1.5 text-xs w-48 focus:outline-none focus:ring-1 focus:ring-primary/50"
                        />
                    </div>

                    <select
                        value={assigneeFilter}
                        onChange={(e) => setAssigneeFilter(e.target.value)}
                        className="bg-card border border-theme rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none hover:bg-muted/50 transition-colors"
                    >
                        <option value="All">All Tasks</option>
                        {currentUserName && <option value={currentUserName}>My Tasks</option>}
                        <option value="Unassigned">Unassigned</option>
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-card border border-theme rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none hover:bg-muted/50 transition-colors"
                    >
                        <option value="All">Status</option>
                        <option value="Pending">To Do</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>

                    <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="bg-card border border-theme rounded-md px-3 py-1.5 text-xs font-medium focus:outline-none hover:bg-muted/50 transition-colors"
                    >
                        <option value="All">Priority</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>

                    <div className="flex-1" />

                    <div className="flex items-center gap-1 p-1 bg-muted/20 border border-theme rounded-lg">
                        <button
                            onClick={() => setView('month')}
                            className={cn(
                                "px-3 py-1 text-[10px] font-bold rounded transition-all",
                                view === 'month' ? "bg-primary/20 text-primary shadow-sm" : "text-muted-foreground opacity-50 hover:opacity-100"
                            )}
                        >
                            Month
                        </button>
                        <button
                            onClick={() => setView('week')}
                            className={cn(
                                "px-3 py-1 text-[10px] font-bold rounded transition-all",
                                view === 'week' ? "bg-primary/20 text-primary shadow-sm" : "text-muted-foreground opacity-50 hover:opacity-100"
                            )}
                        >
                            Week
                        </button>
                    </div>
                </div>
            </div>

            {/* Weekdays */}
            <div className="grid grid-cols-7 border-b border-theme bg-muted/10">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 flex-1 overflow-auto bg-transparent">
                {calendarContent.map((date, idx) => {
                    const dayTasks = date ? getTasksForDay(date) : []
                    return (
                        <div
                            key={idx}
                            className={cn(
                                "min-h-[140px] p-2 border-r border-b border-theme transition-colors group relative",
                                date ? "hover:bg-primary/[0.02]" : "bg-muted/5",
                                date && isSameDay(date, today) && "bg-primary/[0.04]"
                            )}
                            onClick={() => date && setQuickCreateDate(date.getTime())}
                        >
                            {date && (
                                <>
                                    <div className="flex justify-between items-center mb-2 px-1">
                                        <span className={cn(
                                            "flex items-center justify-center w-6 h-6 text-[10px] rounded font-bold transition-all",
                                            isSameDay(date, today)
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                                : "text-muted-foreground opacity-60 group-hover:opacity-100"
                                        )}>
                                            {date.getDate()}
                                        </span>
                                        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-primary/10 rounded transition-all text-primary">
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>

                                    <div className="space-y-1.5 overflow-y-auto max-h-[100px] scrollbar-hide">
                                        {dayTasks.map(task => (
                                            <button
                                                key={task.TaskID}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onTaskClick(task);
                                                }}
                                                className={cn(
                                                    "w-full text-left p-2 rounded border border-theme/50 transition-all hover:border-primary/50 group/card",
                                                    task.Status === 'Completed' ? "bg-card/40 opacity-70" : "bg-card shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                                )}
                                            >
                                                <div className="flex flex-col gap-1.5">
                                                    <div className="flex items-start justify-between gap-1">
                                                        <span className={cn(
                                                            "text-[10px] font-bold leading-tight line-clamp-2",
                                                            task.Status === 'Completed' && "line-through text-muted-foreground"
                                                        )}>
                                                            {task.Title}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-1">
                                                        <div className="flex items-center gap-1.5">
                                                            <Zap className={cn("w-3 h-3",
                                                                task.Priority === 'High' ? "text-red-500" :
                                                                    task.Priority === 'Medium' ? "text-amber-500" : "text-blue-500"
                                                            )} />
                                                            <span className="text-[8px] font-black opacity-30 tracking-tighter">TASK-{task.TaskID}</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            {task.AssignedToName && (
                                                                <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center text-[7px] font-black text-primary border border-primary/10">
                                                                    {task.AssignedToName.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {quickCreateDate === date.getTime() && (
                                        <div
                                            className="absolute inset-0 z-10 bg-card p-2 border-2 border-primary rounded shadow-2xl animate-in zoom-in-95"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <textarea
                                                autoFocus
                                                placeholder="What needs to be done?"
                                                value={quickTitle}
                                                onChange={(e) => setQuickTitle(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleCreate(date);
                                                    }
                                                    if (e.key === 'Escape') setQuickCreateDate(null);
                                                }}
                                                className="w-full h-20 bg-transparent text-xs font-medium focus:outline-none resize-none"
                                            />
                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-theme">
                                                <div className="flex gap-2">
                                                    <Zap className="w-3.5 h-3.5 text-indigo-500" />
                                                    <div className="w-3.5 h-3.5 rounded bg-muted flex items-center justify-center">
                                                        <User className="w-2 h-2 text-muted-foreground" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => setQuickCreateDate(null)}
                                                        className="px-2 py-1 text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleCreate(date)}
                                                        disabled={isCreating || !quickTitle.trim()}
                                                        className="px-2 py-1 bg-primary text-primary-foreground text-[10px] font-black rounded shadow"
                                                    >
                                                        {isCreating ? '...' : 'Create ↵'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
