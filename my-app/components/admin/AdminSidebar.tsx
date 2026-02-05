'use client'

import { Shield, LayoutDashboard, Users, LogOut, Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { logout } from '@/actions/auth'
import { cn } from '@/lib/utils'

export default function AdminSidebar() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    // Handle logout using the server action
    async function handleLogout() {
        await logout()
    }

    const navigation = [
        { name: 'Overview', href: '/admin', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
    ]

    return (
        <>
            {/* Mobile Header */}
            <div className="md:hidden flex items-center justify-between p-4 border-b border-red-500/10 bg-slate-900/50 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-red-500" />
                    </div>
                    <h1 className="font-bold text-xl tracking-tight text-slate-100">Admin</h1>
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

            {/* Sidebar Container */}
            <aside className={cn(
                "fixed inset-y-0 left-0 z-50 w-64 border-r border-red-500/10 bg-slate-900/95 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 md:bg-slate-900/50 md:static",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                                <Shield className="h-5 w-5 text-red-500" />
                            </div>
                            <h1 className="font-bold text-xl tracking-tight text-slate-100">Admin Panel</h1>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 md:hidden"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    <nav className="space-y-1 flex-1">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                                        isActive
                                            ? "text-white bg-white/10"
                                            : "text-slate-400 hover:text-white hover:bg-white/5"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="pt-4 border-t border-white/5 mt-auto">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>
        </>
    )
}
