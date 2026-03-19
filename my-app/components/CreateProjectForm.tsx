'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function CreateProjectForm({ role }: { role: string }) {
    const router = useRouter()

    if (role !== 'Admin' && role !== 'ProjectManager') {
        return (
            <div className="p-6 rounded-2xl bg-card/50 border border-theme border-dashed flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground text-sm">You don't have permission to create projects.</p>
            </div>
        )
    }

    return (
        <div className="group relative p-6 rounded-2xl bg-card border border-theme hover:border-primary/50 hover:bg-muted/50 transition-all duration-300 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-2">Create New Project</h3>
            <p className="text-muted-foreground text-sm mb-4">Start a new collection of tasks.</p>

            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.currentTarget;
                    const formData = new FormData(form);
                    const projectName = formData.get('projectName');

                    try {
                        const response = await fetch('/api/project', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ProjectName: projectName })
                        });

                        if (!response.ok) throw new Error('Failed to create project');

                        toast.success('Project created successfully');
                        form.reset();
                        router.refresh();
                    } catch (error) {
                        console.error('Error:', error);
                        toast.error('Failed to create project');
                    }
                }}
                className="space-y-4"
            >
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
    )
}
