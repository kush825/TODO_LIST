import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import CalendarPageClient from "./CalendarPageClient";

export default async function CalendarPage() {
    const session = await getSession();

    if (!session) {
        redirect("/auth/login");
    }

    // Fetch only tasks assigned to the current user
    const rawTasks = await prisma.tasks.findMany({
        where: {
            OR: [
                { AssignedTo: session.userId },
                // Optionally show unassigned tasks or only assigned to me? 
                // The user said "then it will show current user data and task"
                // So I'll stick to AssignedTo: session.userId
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
    });

    // Flatten the tasks for the client
    const tasks = rawTasks.map(task => ({
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

    return <CalendarPageClient initialTasks={tasks} activeUserName={session.name} activeUserId={session.userId} />;
}
