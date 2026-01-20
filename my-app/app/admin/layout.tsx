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
        <div className="flex flex-col md:flex-row h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
            <AdminSidebar />

            <main className="flex-1 overflow-y-auto">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
