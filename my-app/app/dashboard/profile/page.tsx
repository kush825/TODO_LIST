import { getUserProfile } from '@/actions/profile'
import ProfileHeader from '@/components/ProfileHeader'
import ProfileStats from '@/components/ProfileStats'
import ProfileSettings from '@/components/ProfileSettings'
import { redirect } from 'next/navigation'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default async function ProfilePage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>
}) {
    // Await searchParams before accessing properties
    const params = await searchParams
    const currentPage = Number(params?.page) || 1
    const profile = await getUserProfile(currentPage)

    if (!profile) {
        redirect('/auth/login')
    }

    return (
        <div className="max-w-7xl mx-auto p-8">
            <ProfileHeader user={profile.user} />

            <h2 className="text-xl font-bold text-white mb-6">Overview</h2>
            <ProfileStats stats={profile.stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div id="activity" className="bg-slate-900/50 border border-white/5 rounded-xl p-6 min-h-[300px]">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                        <span className="text-xs text-slate-500">Page {profile.pagination.currentPage} of {profile.pagination.totalPages}</span>
                    </div>

                    <div className="space-y-4">
                        {profile.recentActivity.length > 0 ? (
                            profile.recentActivity.map((activity: any) => (
                                <div key={activity.HistoryID} className="flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group">
                                    <div className={`w-2 h-2 rounded-full ${activity.ChangeType === 'CREATED' ? 'bg-green-500' :
                                        activity.ChangeType === 'UPDATED' ? 'bg-blue-500' :
                                            activity.ChangeType === 'DELETED' ? 'bg-red-500' : 'bg-slate-500'
                                        }`} />
                                    <div>
                                        <p className="text-sm text-slate-300">
                                            <span className="capitalize">{activity.ChangeType.toLowerCase()}</span> task <span className="font-medium">"{activity.tasks.Title}"</span>
                                            {activity.tasks.tasklists?.projects?.ProjectName && (
                                                <span className="text-slate-400"> in <span className="font-medium text-purple-300">{activity.tasks.tasklists.projects.ProjectName}</span></span>
                                            )}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {activity.ChangeTime ? new Date(activity.ChangeTime).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            }) : 'Unknown date'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-slate-500 text-sm">
                                <p>No recent activity found.</p>
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {profile.pagination.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-6 pt-4 border-t border-white/5">
                            <Link
                                scroll={false}
                                href={`/dashboard/profile?page=${currentPage - 1}#activity`}
                                className={`p-2 rounded-lg hover:bg-white/5 transition-colors ${currentPage <= 1 ? 'pointer-events-none opacity-50' : 'text-slate-400 hover:text-white'}`}
                            >
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                            <span className="text-sm text-slate-400">
                                {currentPage}
                            </span>
                            <Link
                                scroll={false}
                                href={`/dashboard/profile?page=${currentPage + 1}#activity`}
                                className={`p-2 rounded-lg hover:bg-white/5 transition-colors ${!profile.pagination.hasMore ? 'pointer-events-none opacity-50' : 'text-slate-400 hover:text-white'}`}
                            >
                                <ChevronRight className="h-5 w-5" />
                            </Link>
                        </div>
                    )}
                </div>

                <ProfileSettings user={profile.user} />
            </div>
        </div>
    )
}
