'use client'

import { LayoutDashboard, LogOut, Plus, ListTodo, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { logout } from '@/actions/auth'
import { usePathname } from 'next/navigation'
import ProjectSidebarItem from './ProjectSidebarItem'
import ProjectSearch from './ProjectSearch'
import { useSearchParams } from 'next/navigation'
import { ThemeToggle } from './ThemeToggle'

interface SidebarProps {
    user: {
        UserName: string,
        Email: string,
        ProfileImage?: string | null
    }
    projects: any[]
}

const SidebarContent = ({
    user,
    projects,
    onClose,
    mobile = false,
    onSearch
}: {
    user: any,
    projects: any[],
    onClose: () => void,
    mobile?: boolean,
    onSearch: (term: string) => void
}) => {
    return (
        <div className="h-full flex flex-col bg-card border-r border-theme">
            <div className="p-6">
                <div className={`flex items-center gap-3 mb-8 ${mobile ? 'hidden' : 'md:flex hidden'}`}>
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <ListTodo className="h-5 w-5 text-white" />
                    </div>
                    <h1 className="font-bold text-xl tracking-tight text-foreground">TaskFlow</h1>
                </div>
                {mobile && (
                    <div className="flex items-center justify-between mb-8 md:hidden">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                                <ListTodo className="h-5 w-5 text-white" />
                            </div>
                            <h1 className="font-bold text-xl tracking-tight text-foreground">TaskFlow</h1>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/10"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                )}

                <div className="space-y-1">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium border border-primary/20 shadow-sm"
                        onClick={onClose}
                    >
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                        Overview
                    </Link>
                </div>

                <div className="mt-8 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Interface</h2>
                        <ThemeToggle />
                    </div>
                </div>
            </div>

            <div className="px-6 mb-2">
                <ProjectSearch onSearch={onSearch} />
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Projects</h2>
                    <Link href="/dashboard" className="h-5 w-5 rounded hover:bg-muted flex items-center justify-center transition-colors">
                        <Plus className="h-3.5 w-3.5 text-muted-foreground" />
                    </Link>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-2 min-h-0">
                <nav className="space-y-1">
                    {projects.map((project: any) => (
                        <ProjectSidebarItem key={project.ProjectID} project={project} />
                    ))}
                    {projects.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">No projects found.</p>
                    )}
                </nav>
            </div>

            <div className="p-4 border-t border-theme">
                <Link
                    href="/dashboard/profile"
                    className="flex items-center gap-3 px-3 py-2 mb-2 hover:bg-muted rounded-lg transition-colors group"
                    onClick={onClose}
                >
                    {user.ProfileImage ? (
                        <img src={user.ProfileImage} alt={user.UserName} className="h-8 w-8 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary transition-all" />
                    ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center text-slate-900 font-bold text-xs ring-2 ring-transparent group-hover:ring-primary transition-all">
                            {user.UserName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate text-foreground group-hover:text-primary transition-colors">{user.UserName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.Email}</p>
                    </div>
                </Link>
                <form action={logout}>
                    <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-red-500 hover:bg-red-500/5 rounded-lg transition-colors">
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    )
}

export default function Sidebar({ user, projects }: SidebarProps) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    // const searchParams = useSearchParams() // No longer reading from URL for filtering

    // Client-side filtering via local state
    const [searchTerm, setSearchTerm] = useState('')

    const filteredProjects = projects.filter(project =>
        project.ProjectName.toLowerCase().includes(searchTerm.toLowerCase())
    )

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

            {/* Mobile Sidebar */}
            <div className={`fixed inset-y-0 left-0 w-64 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent
                    user={user}
                    projects={filteredProjects}
                    onClose={() => setIsOpen(false)}
                    mobile={true}
                    onSearch={setSearchTerm}
                />
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex w-64 flex-shrink-0 flex-col">
                <SidebarContent
                    user={user}
                    projects={filteredProjects}
                    onClose={() => { }}
                    onSearch={setSearchTerm}
                />
            </aside>
        </>
    )
}
