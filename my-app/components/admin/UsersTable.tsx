'use client'

import { useState } from 'react'
import { deleteUser } from '@/actions/admin'
import { Trash2, Shield, ShieldAlert, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function UsersTable({ users }: { users: any[] }) {
    const [loadingId, setLoadingId] = useState<number | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    const filteredUsers = users.filter(user =>
        user.UserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.Email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return

        setLoadingId(id)
        await deleteUser(id)
        setLoadingId(null)
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search users..."
                    className="w-full md:w-64 bg-slate-900 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder:text-slate-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/5">
                                <th className="px-6 py-4 font-semibold text-slate-300">Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-300">Email</th>
                                <th className="px-6 py-4 font-semibold text-slate-300">Role</th>
                                <th className="px-6 py-4 font-semibold text-slate-300">Joined</th>
                                <th className="px-6 py-4 font-semibold text-slate-300 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map((user) => {
                                const isAdmin = user.userroles.some((ur: any) => ur.roles.RoleName === 'Admin')

                                return (
                                    <tr key={user.UserID} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4 font-medium text-white">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                                                    {user.UserName.charAt(0).toUpperCase()}
                                                </div>
                                                {user.UserName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">{user.Email}</td>
                                        <td className="px-6 py-4">
                                            {isAdmin ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                                                    <ShieldAlert className="h-3 w-3" />
                                                    Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
                                                    User
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                            {new Date(user.CreatedAt).toISOString().split('T')[0]}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDelete(user.UserID)}
                                                disabled={loadingId === user.UserID || isAdmin}
                                                className={cn(
                                                    "p-2 rounded-lg transition-all",
                                                    isAdmin
                                                        ? "text-slate-600 cursor-not-allowed opacity-50"
                                                        : "text-slate-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 disabled:opacity-50"
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
                    <div className="p-12 text-center text-slate-500">
                        No users found.
                    </div>
                )}
            </div>
        </div>
    )
}
