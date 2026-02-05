'use client'

import { AlertTriangle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DeleteUserModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    userName: string
    loading: boolean
}

export default function DeleteUserModal({ isOpen, onClose, onConfirm, userName, loading }: DeleteUserModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-md bg-card border border-theme rounded-2xl shadow-2xl p-6 animate-in zoom-in-95 duration-200 overflow-hidden">
                {/* Decorative background gradient */}
                <div className="absolute -top-24 -right-24 h-48 w-48 bg-red-500/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex flex-col items-center text-center space-y-4 pt-2">
                    <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20 mb-2">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">Delete User?</h2>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Are you sure you want to delete <span className="text-foreground font-semibold">"{userName}"</span>?
                            This action is permanent and cannot be undone. All their data will be removed.
                        </p>
                    </div>

                    <div className="flex gap-3 w-full pt-4">
                        <button
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 rounded-xl border border-theme text-muted-foreground hover:text-foreground hover:bg-muted transition-all font-medium text-sm"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className={cn(
                                "flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-medium text-sm shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all",
                                loading ? "opacity-70 cursor-not-allowed" : "hover:scale-[1.02] active:scale-[0.98]"
                            )}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Deleting...
                                </span>
                            ) : (
                                "Yes, Delete User"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
