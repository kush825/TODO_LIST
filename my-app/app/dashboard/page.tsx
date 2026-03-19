import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateProjectForm from "@/components/CreateProjectForm";

export default async function DashboardPage() {
    const session = await getSession();

    if (!session) {
        redirect("/auth/login");
    }

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <header className="mb-12">
                <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
                <p className="text-muted-foreground font-medium">Welcome back, {session.name}.</p>
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-2">
                    Role: {session.role}
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <CreateProjectForm role={session.role} />

                {/* Stats or other widgets can go here */}
                <div className="p-6 rounded-2xl bg-card border border-theme flex flex-col justify-center items-center text-center space-y-2 opacity-60">
                    <p className="text-3xl font-bold">0</p>
                    <p className="text-sm text-muted-foreground">Active Tasks</p>
                </div>
            </div>
        </div>
    );
}
