'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

export function ThemeToggle() {
    const { theme, setTheme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return <div className="h-9 w-64 bg-white/5 rounded-full animate-pulse" />
    }

    const isDark = theme === 'dark'

    return (
        <div className="flex items-center gap-2 p-1 bg-white/5 dark:bg-slate-950/50 rounded-full border border-white/10 w-24 relative overflow-hidden group">
            {/* Animated Background Slider */}
            <div
                className={cn(
                    "absolute inset-y-1 w-[calc(50%-4px)] bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-lg shadow-purple-500/20",
                    isDark ? "left-[calc(50%+2px)]" : "left-1"
                )}
            />

            {/* Light Toggle */}
            <button
                onClick={() => setTheme('light')}
                className={cn(
                    "flex-1 flex items-center justify-center py-1 z-10 transition-colors duration-300",
                    !isDark ? "text-white" : "text-slate-500 hover:text-slate-300"
                )}
            >
                <Sun className="h-4 w-4" />
            </button>

            {/* Dark Toggle */}
            <button
                onClick={() => setTheme('dark')}
                className={cn(
                    "flex-1 flex items-center justify-center py-1 z-10 transition-colors duration-300",
                    isDark ? "text-white" : "text-slate-500 hover:text-slate-300"
                )}
            >
                <Moon className="h-4 w-4" />
            </button>
        </div>
    )
}
