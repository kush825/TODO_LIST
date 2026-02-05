'use client'

import Link from 'next/link'
import { Trash2, Edit2, Check, X } from 'lucide-react'
import { deleteProject, updateProject } from '@/actions/projects'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DeleteConfirmModal from './DeleteConfirmModal'
import { toast } from 'sonner'

export default function ProjectSidebarItem({ project }: { project: any }) {
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [editName, setEditName] = useState(project.ProjectName)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isEditing])

    async function handleDelete() {
        setLoading(true)
        try {
            await deleteProject(project.ProjectID)
            toast.success(`Project "${project.ProjectName}" deleted successfully`)
            setIsDeleting(false)
        } catch (error) {
            toast.error('Failed to delete project')
        } finally {
            setLoading(false)
        }
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
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-theme">
                <input
                    ref={inputRef}
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 bg-transparent border-none text-sm text-foreground focus:outline-none min-w-0"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdate(e)
                        if (e.key === 'Escape') setIsEditing(false)
                    }}
                    onClick={(e) => e.stopPropagation()}
                />
                <button onMouseDown={handleUpdate} className="text-emerald-500 hover:text-emerald-400">
                    <Check className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => setIsEditing(false)} className="text-red-500 hover:text-red-400">
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>
        )
    }

    return (
        <Link
            href={`/dashboard/project/${project.ProjectID}`}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all duration-200 group"
        >
            <div className="flex items-center gap-3 overflow-hidden">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground group-hover:bg-primary transition-colors flex-shrink-0" />
                <span className="truncate">{project.ProjectName}</span>
            </div>

            <div className="flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <button
                    onClick={startEdit}
                    disabled={loading}
                    className="p-1.5 rounded-md hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all disabled:opacity-50"
                    title="Rename Project"
                >
                    <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                    onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsDeleting(true)
                    }}
                    disabled={loading}
                    className="p-1.5 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all disabled:opacity-50"
                    title="Delete Project"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            <DeleteConfirmModal
                isOpen={isDeleting}
                onClose={() => setIsDeleting(false)}
                onConfirm={handleDelete}
                loading={loading}
                title="Delete Project"
                message={`Are you sure you want to delete "${project.ProjectName}"? This action cannot be undone and all associated tasks will be lost.`}
            />
        </Link>
    )
}
