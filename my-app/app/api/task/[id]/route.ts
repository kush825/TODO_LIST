import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const task = await prisma.tasks.findUnique({
            where: { TaskID: parseInt(id) },
            include: {
                users: {
                    select: { UserID: true, UserName: true, ProfileImage: true }
                },
                tasklists: {
                    select: { ListName: true, projects: { select: { ProjectName: true } } }
                },
                taskcomments: {
                    include: { users: { select: { UserName: true } } },
                    orderBy: { CreatedAt: 'asc' }
                }
            }
        });

        if (!task) {
            return NextResponse.json({ error: "Task not found" }, { status: 404 });
        }

        return NextResponse.json(task);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
    }
}

import { getSession } from "@/lib/auth";

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession();
    if (!session || session.role === 'Viewer') {
        return NextResponse.json({ error: "Forbidden: Viewer role cannot update tasks" }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await req.json();

        // Convert DueDate if present
        if (body.DueDate) {
            body.DueDate = new Date(body.DueDate);
        }

        const task = await prisma.tasks.update({
            where: { TaskID: parseInt(id) },
            data: body
        });

        return NextResponse.json(task);
    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.tasks.delete({
            where: { TaskID: parseInt(id) }
        });
        return NextResponse.json({ message: "Task deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
    }
}
