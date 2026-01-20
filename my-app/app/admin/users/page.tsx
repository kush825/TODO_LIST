import { getUsers } from '@/actions/admin'
import UsersTable from '@/components/admin/UsersTable'

export default async function AdminUsersPage() {
    const users = await getUsers()

    return (
        <div className="space-y-6">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
                    <p className="text-slate-400">View and manage system users.</p>
                </div>
                <div className="px-4 py-2 bg-white/5 rounded-lg border border-white/5 text-sm text-slate-400 w-fit">
                    Total: <span className="text-white font-bold ml-1">{users.length}</span>
                </div>
            </header>

            <UsersTable users={users} />
        </div>
    )
}
