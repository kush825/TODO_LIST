'use client'

import { useState } from 'react'
import { deleteUser } from '@/actions/admin'
import { Trash2, Shield, ShieldAlert, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import DeleteUserModal from './DeleteUserModal'

export default function UsersTable({ users }: { users: any[] }) {
    const [loadingId, setLoadingId] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [userToDelete, setUserToDelete] = useState<{ id: number, name: string } | null>(null)

    const filteredUsers = users.filter(user =>
        user.UserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.Email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    function handleDeleteClick(user: any) {
        setUserToDelete({ id: user.UserID, name: user.UserName })
    }

    async function confirmDelete() {
        if (!userToDelete) return

        setLoadingId(userToDelete.id)
        try {
            const result = await deleteUser(userToDelete.id)
            if (result.success) {
                toast.success(result.message || `User "${userToDelete.name}" deleted successfully`)
            } else {
                toast.error(result.error || 'Failed to delete user')
            }
        } catch (error) {
            toast.error('An unexpected error occurred')
        } finally {
            setLoadingId(null)
            setUserToDelete(null)
        }
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full md:w-64 bg-input border border-theme rounded-lg pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="bg-card/50 border border-theme rounded-2xl overflow-hidden backdrop-blur-md shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-theme bg-muted/30">
                                <th className="px-6 py-4 font-semibold text-foreground/70">Name</th>
                                <th className="px-6 py-4 font-semibold text-foreground/70">Email</th>
                                <th className="px-6 py-4 font-semibold text-foreground/70">Role</th>
                                <th className="px-6 py-4 font-semibold text-foreground/70">Joined</th>
                                <th className="px-6 py-4 font-semibold text-foreground/70 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-theme/50">
                            {filteredUsers.map((user) => {
                                const isAdmin = user.userroles.some((ur: any) => ur.roles.RoleName === 'Admin')

                                return (
                                    <tr key={user.UserID} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
                                                    {user.UserName.charAt(0).toUpperCase()}
                                                </div>
                                                {user.UserName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground">{user.Email}</td>
                                        <td className="px-6 py-4">
                                            {isAdmin ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
                                                    <ShieldAlert className="h-3 w-3" />
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                                                    User
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                                            {new Date(user.CreatedAt).toISOString().split('T')[0]}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteClick(user)}
                                                disabled={loadingId === user.UserID || isAdmin}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all",
                                                    isAdmin
                                                        ? "text-muted-foreground/30 cursor-not-allowed"
                                                        : "text-muted-foreground hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                                                )}
                                                title={isAdmin ? "Cannot delete admin" : "Delete User"}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-muted-foreground">
                        No users found.
                    </div>
                )}

            </div>

            <DeleteUserModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={confirmDelete}
                userName={userToDelete?.name || ''}
                loading={loadingId === userToDelete?.id}
            />
        </div>
    )
}
