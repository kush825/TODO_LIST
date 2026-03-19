'use client'

import AcademicCalendarView, { AcademicEvent } from './AcademicCalendarView'
import { GraduationCap, ArrowLeft, Info } from 'lucide-react'
import Link from 'next/link'

interface AcademicCalendarClientProps {
    events: AcademicEvent[]
}

export default function AcademicCalendarClient({ events }: AcademicCalendarClientProps) {
    return (
        <div className="h-full flex flex-col p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 text-primary font-bold text-sm mb-1 uppercase tracking-wider">
                        <GraduationCap className="w-4 h-4" />
                        Institutional Schedule
                    </div>
                    <h1 className="text-4xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                        Academic Calendar
                    </h1>
                    <p className="text-muted-foreground font-medium max-w-2xl">
                        Official academic schedule including term dates, exams, and holidays for the 2025-2026 academic year.
                    </p>
                </div>

                <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground text-sm font-bold rounded-xl transition-all border border-theme shadow-sm w-fit"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Link>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 h-full min-h-[700px]">
                    <AcademicCalendarView events={events} />
                </div>

                <div className="space-y-6">
                    <div className="bg-card/50 backdrop-blur-xl border border-theme rounded-2xl p-6 shadow-xl">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary" />
                            Legend
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                                <span className="text-sm font-medium text-muted-foreground">Completed Events</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-primary shadow-lg shadow-primary/20" />
                                <span className="text-sm font-medium text-muted-foreground">Upcoming / Current</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20">
                        <h3 className="text-lg font-bold mb-2">Note</h3>
                        <p className="text-sm text-white/80 leading-relaxed font-medium">
                            This calendar is read-only and reflects the official university schedule. For personal tasks, use the main dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
