import { Folder, CheckCircle, Clock, PieChart } from 'lucide-react'

interface ProfileStatsProps {
    stats: {
        projects: number
        totalTasks: number
        completedTasks: number
        pendingTasks: number
        completionRate: number
    }
}

export default function ProfileStats({ stats }: ProfileStatsProps) {
    const statItems = [
        {
            label: 'Total Projects',
            value: stats.projects,
            icon: Folder,
            color: 'text-blue-500',
            bg: 'bg-blue-500/10'
        },
        {
            label: 'Total Tasks',
            value: stats.totalTasks,
            icon: PieChart,
            color: 'text-purple-500',
            bg: 'bg-purple-500/10'
        },
        {
            label: 'Completed',
            value: stats.completedTasks,
            icon: CheckCircle,
            color: 'text-green-500',
            bg: 'bg-green-500/10'
        },
        {
            label: 'Task Progress',
            value: `${stats.completionRate}%`,
            icon: Clock,
            color: 'text-orange-500',
            bg: 'bg-orange-500/10',
            extra: (
                <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                        className="bg-orange-500 h-full transition-all duration-500 ease-out"
                        style={{ width: `${stats.completionRate}%` }}
                    />
                </div>
            )
        }
    ]

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statItems.map((item, index) => (
                <div key={index} className="bg-slate-900/50 border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-2 rounded-lg ${item.bg}`}>
                            <item.icon className={`w-5 h-5 ${item.color}`} />
                        </div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white mb-1">{item.value}</div>
                        <div className="text-sm text-slate-500">{item.label}</div>
                    </div>
                    {item.extra}
                </div>
            ))}
        </div>
    )
}
