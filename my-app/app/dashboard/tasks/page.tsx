import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import TasksPageClient from "@/app/dashboard/tasks/TasksPageClient";

export default async function AllTasksPage() {
    const session = await getSession();

    if (!session) {
        redirect("/auth/login");
    }

    const tasks = await prisma.tasks.findMany({
        where: {
            OR: [
                { AssignedTo: session.userId },
                {
                    tasklists: {
                        projects: {
                            CreatedBy: session.userId
                        }
                    }
                }
            ]
        },
        include: {
            users: {
                select: {
                    UserName: true
                }
            },
            tasklists: {
                include: {
                    projects: {
                        select: {
                            ProjectID: true,
                            ProjectName: true
                        }
                    }
                }
            }
        },
        orderBy: {
            DueDate: 'asc'
        }
    }) as any[];

    const flattenedTasks = tasks.map(task => ({
        TaskID: task.TaskID,
        Title: task.Title,
        Description: task.Description,
        Status: task.Status,
        Priority: task.Priority,
        DueDate: task.DueDate,
        CreatedAt: task.CreatedAt,
        ListID: task.ListID,
        ProjectID: task.tasklists.ProjectID,
        ProjectName: task.tasklists.projects.ProjectName,
        AssignedToName: task.users?.UserName || 'Unassigned'
    }));

    return (
        <TasksPageClient
            initialTasks={flattenedTasks}
            activeUserName={session.name}
            activeUserId={session.userId}
            userRole={session.role}
        />
    );
}
