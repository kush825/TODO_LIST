'use client'

import { Search } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export default function ProjectSearch({ onSearch }: { onSearch?: (term: string) => void }) {
    const { replace } = useRouter()
    const searchParams = useSearchParams()

    const handleSearch = useDebouncedCallback((term: string) => {
        if (onSearch) {
            onSearch(term)
            return
        }

        const params = new URLSearchParams(searchParams)
        if (term) {
            params.set('search', term)
        } else {
            params.delete('search')
        }
        replace(`/dashboard?${params.toString()}`)
    }, 300)

    return (
        <div className="relative mb-4">
            <input
                type="text"
                placeholder="Search projects..."
                className="w-full bg-slate-900 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-slate-500"
                onChange={(e) => handleSearch(e.target.value)}
                defaultValue={onSearch ? undefined : searchParams.get('search')?.toString()}
            />
            <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>
    )
}
