'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, GraduationCap, Search, Calendar as CalendarIcon, Info, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

export type AcademicEvent = {
    Title: string
    StartDate: string
    EndDate?: string
    Description: string
    IsCompleted: boolean
}

interface AcademicCalendarViewProps {
    events: AcademicEvent[]
}

export default function AcademicCalendarView({ events }: AcademicCalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [searchTerm, setSearchTerm] = useState('')

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const handlePrev = () => setCurrentDate(new Date(year, month - 1, 1))
    const handleNext = () => setCurrentDate(new Date(year, month + 1, 1))

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    const filteredEvents = events.filter(event =>
        event.Title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.Description.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getEventsForDay = (date: Date) => {
        return filteredEvents.filter(event => {
            const start = new Date(event.StartDate)
            const end = event.EndDate ? new Date(event.EndDate) : start

            // Normalize to start of day for comparison
            const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            const s = new Date(start.getFullYear(), start.getMonth(), start.getDate())
            const e = new Date(end.getFullYear(), end.getMonth(), end.getDate())

            return d >= s && d <= e
        })
    }

    const today = new Date()
    const isSameDay = (d1: Date, d2: Date) =>
        d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate()

    const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate()
    const firstDayOfMonth = (y: number, m: number) => new Date(y, m, 1).getDay()

    const getMonthDays = () => {
        const days = []
        const numDays = daysInMonth(year, month)
        const firstDay = firstDayOfMonth(year, month)
        for (let i = 0; i < firstDay; i++) days.push(null)
        for (let i = 1; i <= numDays; i++) days.push(new Date(year, month, i))
        return days
    }

    return (
        <div className="flex flex-col h-full bg-card/60 backdrop-blur-xl border border-theme rounded-2xl overflow-hidden shadow-2xl">
            <div className="flex flex-col gap-4 p-6 border-b border-theme bg-muted/10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <span>Academic</span>
                            <span className="opacity-50">/</span>
                            <span className="text-foreground font-bold flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-primary" />
                                Schedule 2025-26
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center bg-muted/30 p-1 rounded-lg border border-theme">
                        <button onClick={handlePrev} className="p-1.5 hover:bg-white/5 rounded transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                        <span className="px-4 text-sm font-bold min-w-[140px] text-center">
                            {monthNames[month]} {year}
                        </span>
                        <button onClick={handleNext} className="p-1.5 hover:bg-white/5 rounded transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        <div className="w-px h-4 bg-theme mx-2" />
                        <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1 text-xs font-bold hover:bg-white/5 rounded transition-colors uppercase tracking-tight">Current</button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            placeholder="Search academic events..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-card border border-theme rounded-lg pl-10 pr-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-theme bg-muted/5">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-3 text-center text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 flex-1 overflow-auto">
                {getMonthDays().map((date, idx) => {
                    const dayEvents = date ? getEventsForDay(date) : []
                    return (
                        <div
                            key={idx}
                            className={cn(
                                "min-h-[120px] p-2 border-r border-b border-theme transition-colors group relative",
                                !date && "bg-muted/5",
                                date && isSameDay(date, today) && "bg-primary/[0.03]"
                            )}
                        >
                            {date && (
                                <>
                                    <div className="flex justify-start mb-2">
                                        <span className={cn(
                                            "flex items-center justify-center w-7 h-7 text-xs rounded-lg font-bold transition-all",
                                            isSameDay(date, today)
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                                                : "text-muted-foreground group-hover:text-foreground"
                                        )}>
                                            {date.getDate()}
                                        </span>
                                    </div>

                                    <div className="space-y-1">
                                        {dayEvents.map((event, eIdx) => (
                                            <div
                                                key={eIdx}
                                                className={cn(
                                                    "p-1.5 rounded-md text-[10px] font-bold leading-tight border transition-all",
                                                    event.IsCompleted
                                                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                                        : "bg-primary/10 border-primary/20 text-primary animate-pulse-subtle"
                                                )}
                                                title={event.Description}
                                            >
                                                <div className="flex items-center gap-1">
                                                    {event.IsCompleted ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Clock className="w-2.5 h-2.5" />}
                                                    <span className="truncate">{event.Title}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
