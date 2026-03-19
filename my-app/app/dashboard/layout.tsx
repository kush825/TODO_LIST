import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import { ThemeProvider } from '@/components/ThemeProvider'

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

    // Role-aware project fetching
    let projects;
    if (session.role === 'Admin' || session.role === 'ProjectManager') {
        // Admins and Managers see all projects
        projects = await prisma.projects.findMany({
            orderBy: { CreatedAt: 'desc' },
        })
    } else {
        // Team Members and Viewers see projects they created OR have tasks assigned in
        projects = await prisma.projects.findMany({
            where: {
                OR: [
                    { CreatedBy: session.userId },
                    {
                        tasklists: {
                            some: {
                                tasks: {
                                    some: {
                                        AssignedTo: session.userId
                                    }
                                }
                            }
                        }
                    }
                ]
            },
            orderBy: { CreatedAt: 'desc' },
        })
    }

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <div className="flex min-h-screen md:h-dvh w-full md:overflow-hidden flex-col md:flex-row bg-background text-foreground font-sans selection:bg-purple-500/30 transition-colors duration-300">
                <Sidebar
                    user={{
                        UserName: userName,
                        Email: userEmail,
                        ProfileImage: userImage,
                        role: session.role
                    }}
                    projects={projects}
                />

                {/* Main Content */}
                <main className="flex-1 md:overflow-y-auto mesh-gradient relative">
                    <div className="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] [mask-image:linear-gradient(to_bottom,white,transparent)] pointer-events-none" />
                    <div className="relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </ThemeProvider>
    )
}
