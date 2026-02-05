import { createProject } from '@/actions/projects'

export default function DashboardPage() {
    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
            <header className="mb-12">
                <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
                <p className="text-muted-foreground font-medium">Welcome to your workspace.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Create Project Card */}
                <div className="group relative p-6 rounded-2xl bg-card border border-theme hover:border-primary/50 hover:bg-muted/50 transition-all duration-300 shadow-sm">
                    <h3 className="text-lg font-semibold text-foreground mb-2">Create New Project</h3>
                    <p className="text-muted-foreground text-sm mb-4">Start a new collection of tasks.</p>

                    <form action={async (formData) => {
                        'use server'
                        await createProject(formData)
                    }} className="space-y-4">
                        <input
                            name="projectName"
                            placeholder="Project Name..."
                            className="w-full bg-input border border-theme rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            required
                        />
                        <button
                            type="submit"
                            className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            Create Project
                        </button>
                    </form>
                </div>

                {/* Stats or other widgets can go here */}
            </div>
        </div>
    )
}
