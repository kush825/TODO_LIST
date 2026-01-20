'use client'

import { LayoutDashboard, LogOut, Plus, ListTodo, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { logout } from '@/actions/auth'
import { usePathname } from 'next/navigation'
import ProjectSidebarItem from './ProjectSidebarItem'

interface MobileSidebarProps {
    user: {
        UserName: string,
        Email: string,
        ProfileImage?: string | null
    }
    projects: any[]
}

export default function MobileSidebar({ user, projects }: MobileSidebarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    // Close sidebar on route change
    useEffect(() => {
        setIsOpen(false)
    }, [pathname])

    return (
        <>
            {/* Mobile Header / Trigger */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <ListTodo className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="font-bold text-xl tracking-tight text-white">TaskFlow</h1>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-white/10 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <ListTodo className="h-5 w-5 text-white" />
                                </div>
                                <h1 className="font-bold text-xl tracking-tight text-white">TaskFlow</h1>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="space-y-1">
                            <Link
                                href="/dashboard"
                                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 text-white font-medium ring-1 ring-white/5 shadow-sm"
                                onClick={() => setIsOpen(false)}
                            >
                                <LayoutDashboard className="h-4 w-4 text-purple-400" />
                                Overview
                            </Link>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 py-2">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Projects</h2>
                            <Link href="/dashboard" className="h-5 w-5 rounded hover:bg-white/10 flex items-center justify-center transition-colors">
                                <Plus className="h-3.5 w-3.5 text-slate-400" />
                            </Link>
                        </div>

                        <nav className="space-y-1">
                            {projects.map((project: any) => (
                                <ProjectSidebarItem key={project.ProjectID} project={project} />
                            ))}
                            {projects.length === 0 && (
                                <p className="text-xs text-slate-500 italic">No projects yet.</p>
                            )}
                        </nav>
                    </div>

                    <div className="p-4 border-t border-white/5">
                        <Link
                            href="/dashboard/profile"
                            className="flex items-center gap-3 px-3 py-2 mb-2 hover:bg-white/5 rounded-lg transition-colors group"
                            onClick={() => setIsOpen(false)}
                        >
                            {user.ProfileImage ? (
                                <img src={user.ProfileImage} alt={user.UserName} className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-purple-500/50 transition-all" />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-900 font-bold text-xs ring-2 ring-transparent group-hover:ring-purple-500/50 transition-all">
                                    {user.UserName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <div className="overflow-hidden">
                                <p className="text-sm font-medium truncate text-white group-hover:text-purple-300 transition-colors">{user.UserName}</p>
                                <p className="text-xs text-slate-500 truncate">{user.Email}</p>
                            </div>
                        </Link>
                        <form action={logout}>
                            <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors">
                                <LogOut className="h-4 w-4" />
                                Sign Out
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
