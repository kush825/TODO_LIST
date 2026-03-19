import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const tasks = await prisma.tasks.findMany({
            include: {
                users: {
                    select: {
                        UserID: true,
                        UserName: true,
                        ProfileImage: true,
                    },
                },
                tasklists: {
                    select: {
                        ListName: true,
                        projects: {
                            select: {
                                ProjectName: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                CreatedAt: 'desc',
            },
        });

        return NextResponse.json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
    const session = await getSession();
    if (!session || session.role === 'Viewer') {
        return NextResponse.json({ error: "Forbidden: Insufficient permissions" }, { status: 403 });
    }

    try {
        const { ListID, Title, Description, Priority, Status, DueDate, AssignedTo } = await req.json();

        if (!ListID || !Title) {
            return NextResponse.json({ error: "ListID and Title are required" }, { status: 400 });
        }

        const task = await prisma.tasks.create({
            data: {
                ListID,
                Title,
                Description,
                Priority,
                Status: Status || 'Pending',
                DueDate: DueDate ? new Date(DueDate) : null,
                AssignedTo
            }
        });

        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error("Error creating task:", error);
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}
