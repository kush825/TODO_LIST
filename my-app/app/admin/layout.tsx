
import { isAdmin } from '@/actions/admin'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'


export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    // Client-side protection is good, but server-side is better
    if (!await isAdmin()) {
        redirect('/dashboard')
    }
    return (
        <div className="flex flex-col md:flex-row min-h-screen md:h-dvh bg-slate-950 text-slate-100 font-sans md:overflow-hidden">
            <AdminSidebar />

            <main className="flex-1 md:overflow-y-auto">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
