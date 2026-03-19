'use client'

import { CheckCircle2, Clock, ListTodo, MoreHorizontal, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'

type Task = {
    TaskID: number
    Title: string
    Status?: string | null
    UpdatedAt?: Date | null
    CreatedAt?: Date | null
}

interface SummaryViewProps {
    tasks: Task[]
}

export default function SummaryView({ tasks }: SummaryViewProps) {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.Status === 'Completed').length
    const inProgressTasks = tasks.filter(t => t.Status === 'In Progress').length
    const todoTasks = tasks.filter(t => t.Status === 'Pending' || !t.Status).length

    // Mocking "last 7 days" data for now based on CreatedAt/UpdatedAt
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    // Helper to get a proper Date object
    const parseDate = (d: any) => {
        if (!d) return null
        const date = new Date(d)
        return isNaN(date.getTime()) ? null : date
    }

    const completedLast7Days = tasks.filter(t => {
        const lastActivity = parseDate(t.UpdatedAt) || parseDate(t.CreatedAt)
        return t.Status === 'Completed' && lastActivity && lastActivity > sevenDaysAgo
    }).length

    const updatedLast7Days = tasks.filter(t => {
        const lastActivity = parseDate(t.UpdatedAt) || parseDate(t.CreatedAt)
        return lastActivity && lastActivity > sevenDaysAgo
    }).length

    // Donut chart calculations
    const radius = 80
    const circumference = 2 * Math.PI * radius

    // Percentages
    const donePercent = totalTasks > 0 ? (completedTasks / totalTasks) : 0
    const inProgressPercent = totalTasks > 0 ? (inProgressTasks / totalTasks) : 0
    const todoPercent = totalTasks > 0 ? (todoTasks / totalTasks) : 0

    // Stroke offsets
    const doneOffset = 0
    const inProgressOffset = circumference * donePercent
    const todoOffset = circumference * (donePercent + inProgressPercent)

    return (
        <div className="flex flex-col gap-8 p-6 animate-in fade-in duration-500">
            {/* Header with Filter */}
            <div className="flex items-center justify-between">
                <button className="flex items-center gap-2 px-3 py-1.5 bg-muted/30 border border-theme rounded-md text-xs font-bold hover:bg-muted transition-colors">
                    <Filter className="w-3.5 h-3.5" />
                    Filter
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-6 bg-muted/10 border border-theme rounded-xl hover:bg-muted/20 transition-all group">
                    <div className="p-3 bg-emerald-500/10 rounded-lg group-hover:scale-110 transition-transform">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <p className="text-xl font-bold">{completedLast7Days} completed</p>
                        <p className="text-xs text-muted-foreground">in the last 7 days</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-6 bg-muted/10 border border-theme rounded-xl hover:bg-muted/20 transition-all group">
                    <div className="p-3 bg-blue-500/10 rounded-lg group-hover:scale-110 transition-transform">
                        <Clock className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <p className="text-xl font-bold">{updatedLast7Days} updated</p>
                        <p className="text-xs text-muted-foreground">in the last 7 days</p>
                    </div>
                </div>
            </div>

            {/* Status Overview Card */}
            <div className="p-8 bg-card border border-theme rounded-2xl shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold">Status overview</h3>
                    <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-8">
                    Get a snapshot of the status of your work items. <span className="text-primary hover:underline cursor-pointer font-medium ml-1">View all work items</span>
                </p>

                <div className="flex flex-col md:flex-row items-center justify-around gap-12 py-4">
                    {/* Donut Chart SVG */}
                    <div className="relative w-48 h-48">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                            {/* Background Circle */}
                            <circle
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="20"
                                className="text-muted/10"
                            />
                            {/* Done Slice */}
                            <circle
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="transparent"
                                stroke="#84cc16" // lime-500
                                strokeWidth="20"
                                strokeDasharray={`${circumference * donePercent} ${circumference}`}
                                strokeDashoffset={-doneOffset}
                                className="transition-all duration-1000 ease-out"
                            />
                            {/* In Progress Slice */}
                            <circle
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="transparent"
                                stroke="#3b82f6" // blue-500
                                strokeWidth="20"
                                strokeDasharray={`${circumference * inProgressPercent} ${circumference}`}
                                strokeDashoffset={-inProgressOffset}
                                className="transition-all duration-1000 ease-out"
                            />
                            {/* To Do Slice */}
                            <circle
                                cx="100"
                                cy="100"
                                r={radius}
                                fill="transparent"
                                stroke="#94a3b8" // slate-400
                                strokeWidth="20"
                                strokeDasharray={`${circumference * todoPercent} ${circumference}`}
                                strokeDashoffset={-todoOffset}
                                className="transition-all duration-1000 ease-out"
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-4xl font-black">{totalTasks}</span>
                            <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Total work items</span>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded bg-[#84cc16]" />
                            <span className="text-sm font-bold text-muted-foreground">Done: {completedTasks}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded bg-[#3b82f6]" />
                            <span className="text-sm font-bold text-muted-foreground">In Progress: {inProgressTasks}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded bg-[#94a3b8]" />
                            <span className="text-sm font-bold text-muted-foreground">To Do: {todoTasks}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
