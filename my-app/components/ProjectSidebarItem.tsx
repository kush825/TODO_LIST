'use client'

import Link from 'next/link'
import { Trash2, Edit2, Check, X } from 'lucide-react'
import { deleteProject, updateProject } from '@/actions/projects'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProjectSidebarItem({ project }: { project: any }) {
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editName, setEditName] = useState(project.ProjectName)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isEditing])

    async function handleDelete(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()

        if (!confirm('Are you sure you want to delete this project?')) return

        setLoading(true)
        await deleteProject(project.ProjectID)
        setLoading(false)
    }

    async function handleUpdate(e: React.MouseEvent | React.FormEvent) {
        e.preventDefault()
        e.stopPropagation()

        if (!editName.trim() || editName === project.ProjectName) {
            setIsEditing(false)
            setEditName(project.ProjectName)
            return
        }

        setLoading(true)
        await updateProject(project.ProjectID, editName)
        setLoading(false)
        setIsEditing(false)
        router.refresh()
    }

    function startEdit(e: React.MouseEvent) {
        e.preventDefault()
        e.stopPropagation()
        setIsEditing(true)
    }

    if (isEditing) {
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10">
                <input
                    ref={inputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-transparent border-none text-sm text-white focus:outline-none min-w-0"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate(e)
                        if (e.key === 'Escape') setIsEditing(false)
                    }}
                    onClick={(e) => e.stopPropagation()}
                />
                <button onMouseDown={handleUpdate} className="text-emerald-400 hover:text-emerald-300">
                    <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setIsEditing(false)} className="text-red-400 hover:text-red-300">
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        )
    }

    return (
        <Link
            href={`/dashboard/project/${project.ProjectID}`}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-all duration-200 group"
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover:bg-purple-400 transition-colors flex-shrink-0" />
                <span className="truncate">{project.ProjectName}</span>
            </div>

            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                    onClick={startEdit}
                    disabled={loading}
                    className="p-1.5 rounded-md hover:bg-blue-500/10 text-slate-500 hover:text-blue-400 transition-all disabled:opacity-50"
                    title="Rename Project"
                >
                    <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    className="p-1.5 rounded-md hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-all disabled:opacity-50"
                    title="Delete Project"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </Link>
    )
}
