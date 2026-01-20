import { getAdminStats } from '@/actions/admin'
import { Users, Folder, CheckSquare } from 'lucide-react'

export default async function AdminDashboard() {
    const stats = await getAdminStats()

    if (!stats) return null

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-bold text-white mb-2">Admin Overview</h1>
                <p className="text-slate-400">System statistics and management.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total Users"
                    value={stats.users}
                    icon={<Users className="h-6 w-6 text-blue-400" />}
                    color="bg-blue-500/10 border-blue-500/20"
                />
                <StatCard
                    title="Total Projects"
                    value={stats.projects}
                    icon={<Folder className="h-6 w-6 text-purple-400" />}
                    color="bg-purple-500/10 border-purple-500/20"
                />
                <StatCard
                    title="Total Tasks"
                    value={stats.tasks}
                    icon={<CheckSquare className="h-6 w-6 text-emerald-400" />}
                    color="bg-emerald-500/10 border-emerald-500/20"
                />
            </div>
        </div>
    )
}

function StatCard({ title, value, icon, color }: any) {
    return (
        <div className={`p-6 rounded-2xl border ${color} bg-slate-900/50 backdrop-blur-sm`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider">{title}</h3>
                <div className="p-2 rounded-lg bg-slate-900 shadow-sm">{icon}</div>
            </div>
            <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
        </div>
    )
}
