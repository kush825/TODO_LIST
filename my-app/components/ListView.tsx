'use client'

import { useState } from 'react'
import { Calendar, MoreHorizontal, Clock, Flag, CheckCircle2, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'

type Task = {
    TaskID: number
    Title: string
    Description?: string | null
    Status?: string | null
    Priority?: string | null
    DueDate?: Date | null
    CreatedAt?: Date | null
}

export default function ListView({
    tasks,
    onTaskClick,
    onStatusUpdate
}: {
    tasks: Task[],
    onTaskClick: (task: Task) => void,
    onStatusUpdate: (id: number, status: string) => void
}) {
    return (
        <div className="bg-card border border-theme rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-muted/50 border-b border-theme">
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-12 text-center">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Task Title</th>
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-32">Priority</th>
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-40">Due Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider w-48 text-right">Created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {tasks.length > 0 ? (
                            tasks.map((task) => (
                                <tr
                                    key={task.TaskID}
                                    onClick={() => onTaskClick(task)}
                                    className="group hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            onClick={() => onStatusUpdate(task.TaskID, task.Status === 'Completed' ? 'Pending' : 'Completed')}
                                            className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                        >
                                            {task.Status === 'Completed' ? (
                                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                                            ) : (
                                                <Circle className="h-5 w-5" />
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className={cn(
                                                "text-sm font-semibold text-foreground",
                                                task.Status === 'Completed' && "line-through text-muted-foreground/60"
                                            )}>
                                                {task.Title}
                                            </span>
                                            {task.Description && (
                                                <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                                                    {task.Description}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                            task.Priority === 'High' ? "bg-red-500/10 text-red-500" :
                                                task.Priority === 'Medium' ? "bg-yellow-500/10 text-yellow-500" :
                                                    "bg-blue-500/10 text-blue-500"
                                        )}>
                                            {task.Priority || 'Low'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{task.DueDate ? new Date(task.DueDate).toLocaleDateString() : 'No date'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-[10px] text-muted-foreground/50">
                                            <Clock className="h-3 w-3" />
                                            <span>{task.CreatedAt ? new Date(task.CreatedAt).toLocaleString(undefined, {
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'N/A'}</span>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic text-sm">
                                    No tasks found in this project.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
