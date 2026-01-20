'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ListTodo } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Navbar() {
    const pathname = usePathname()

    // Hide navbar on dashboard or admin routes
    if (pathname?.startsWith('/dashboard') || pathname?.startsWith('/admin')) {
        return null
    }

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform duration-200">
                            <ListTodo className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">TaskFlow</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/auth/login"
                            className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            Sign In
                        </Link>
                        <Link
                            href="/auth/register"
                            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-sm font-medium text-white ring-1 ring-white/10 transition-all hover:ring-white/20"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>
            <div className="h-16" />
        </>
    )
}
