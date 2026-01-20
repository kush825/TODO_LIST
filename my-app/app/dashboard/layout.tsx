import { getProjects } from '@/actions/projects'
import { getSession, clearSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, LogOut, Plus, ListTodo } from 'lucide-react'
import { revalidatePath } from 'next/cache'
import ProjectSidebarItem from '@/components/ProjectSidebarItem'
import ProjectSearch from '@/components/ProjectSearch'

import { logout } from '@/actions/auth'
import Sidebar from '@/components/Sidebar'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getSession()
    if (!session?.userId) redirect('/auth/login')

    // Fetch up-to-date user details including profile image
    const user = await prisma.users.findUnique({
        where: { UserID: session.userId },
        select: {
            UserName: true, Email: true,
            // @ts-ignore
            ProfileImage: true
        }
    })

    if (!user) redirect('/auth/login')

    const userName = user.UserName
    const userEmail = user.Email
    // @ts-ignore
    const userImage = user.ProfileImage

    const projects = await getProjects()

    return (
        <div className="flex h-dvh w-full overflow-hidden flex-col md:flex-row bg-slate-900 text-slate-100 font-sans selection:bg-purple-500/30">
            <Sidebar
                user={{
                    UserName: userName,
                    Email: userEmail,
                    ProfileImage: userImage
                }}
                projects={projects}
            />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-slate-950 bg-[url('/grid.svg')] bg-[size:100px_100px]">
                {children}
            </main>
        </div>
    )
}
