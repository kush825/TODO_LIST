'use client'

import { useState, useEffect } from 'react'
import { X, Trash2, Save, MessageSquare, Clock, Send } from 'lucide-react'
import { updateTaskDetails, addComment, getTaskDetails } from '@/actions/tasks'
import { cn } from '@/lib/utils'

export default function TaskModal({ task: initialTask, onClose, onUpdate, onDelete }: {
    task: any,
    onClose: () => void,
    onUpdate: (id: number, data: any) => Promise<void>,
    onDelete: (id: number) => Promise<void>
}) {
    const [task, setTaskData] = useState(initialTask)
    const [title, setTitle] = useState(initialTask.Title)
    const [description, setDescription] = useState(initialTask.Description || '')
    const [priority, setPriority] = useState(initialTask.Priority || 'Medium')
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details')
    const [newComment, setNewComment] = useState('')
    const [comments, setComments] = useState<any[]>([])
    const [history, setHistory] = useState<any[]>([])

    useEffect(() => {
        // Fetch full details including comments and history
        getTaskDetails(initialTask.TaskID).then((data) => {
            if (data) {
                setTaskData(data)
                setComments(data.taskcomments || [])
                setHistory(data.taskhistory || [])
            }
        })
    }, [initialTask.TaskID])

    async function handleSave() {
        setLoading(true)
        await onUpdate(task.TaskID, { title, description, priority })
        setLoading(false)
        onClose()
    }

    async function handleDelete() {
        // Confirmation is handled by the parent component
        onDelete(task.TaskID)
        onClose()
    }

    async function handleAddComment() {
        if (!newComment.trim()) return
        await addComment(task.TaskID, newComment)
        setNewComment('')
        // Refresh local data
        const data = await getTaskDetails(task.TaskID)
        if (data) {
            setComments(data.taskcomments || [])
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-card border border-theme rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-theme bg-muted/30">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", activeTab === 'details' ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted")}
                        >
                            Details
                        </button>
                        <button
                            onClick={() => setActiveTab('comments')}
                            className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2", activeTab === 'comments' ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted")}
                        >
                            Comments <span className="text-xs opacity-50">{comments.length}</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('history')}
                            className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", activeTab === 'history' ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted")}
                        >
                            History
                        </button>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-muted rounded-lg transition-colors">
                        <X className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'details' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Title</label>
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={5}
                                    className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Priority</label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value)}
                                        className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    >
                                        <option value="Low">Low</option>
                                        <option value="Medium">Medium</option>
                                        <option value="High">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Created At</label>
                                    <div className="w-full bg-muted/30 border border-theme/50 rounded-lg px-3 py-2 text-muted-foreground text-sm">
                                        {task.CreatedAt ? new Date(task.CreatedAt).toLocaleString() : 'N/A'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Last Updated</label>
                                    <div className="w-full bg-muted/30 border border-theme/50 rounded-lg px-3 py-2 text-muted-foreground text-sm">
                                        {task.UpdatedAt ? new Date(task.UpdatedAt).toLocaleString() : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'comments' && (
                        <div className="flex flex-col h-full">
                            <div className="flex-1 space-y-4 mb-4">
                                {comments.length === 0 ? (
                                    <p className="text-center text-muted-foreground text-sm py-8">No comments yet.</p>
                                ) : (
                                    comments.map((comment) => (
                                        <div key={comment.CommentID} className="flex gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
                                                {comment.users.UserName.charAt(0)}
                                            </div>
                                            <div className="flex-1 bg-muted/30 rounded-lg p-3 border border-theme">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-sm font-semibold text-foreground">{comment.users.UserName}</span>
                                                    <span className="text-xs text-muted-foreground">{new Date(comment.CreatedAt).toLocaleString()}</span>
                                                </div>
                                                <p className="text-sm text-foreground/80">{comment.CommentText}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="w-full bg-input border border-theme rounded-lg pl-4 pr-12 py-3 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleAddComment()
                                    }}
                                />
                                <button
                                    onClick={handleAddComment}
                                    className="absolute right-2 top-2 p-1.5 bg-primary hover:bg-primary-hover text-white rounded-md transition-colors"
                                >
                                    <Send className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div className="space-y-4">
                            {/* History implementation would go here similarly */}
                            <p className="text-muted-foreground text-sm flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Task history is being tracked.
                            </p>
                        </div>
                    )}
                </div>

                {activeTab === 'details' && (
                    <div className="flex items-center justify-between p-4 bg-muted/30 border-t border-theme">
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-medium"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete
                        </button>
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg transition-colors text-sm font-medium shadow-lg shadow-primary/20"
                            >
                                <Save className="h-4 w-4" />
                                Save Changes
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
