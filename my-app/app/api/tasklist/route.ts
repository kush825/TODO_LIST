import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const taskLists = await prisma.tasklists.findMany({
            include: {
                projects: {
                    select: { ProjectName: true }
                },
                _count: {
                    select: { tasks: true }
                }
            }
        });
        return NextResponse.json(taskLists);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch task lists" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { ProjectID, ListName } = await req.json();

        if (!ProjectID || !ListName) {
            return NextResponse.json({ error: "ProjectID and ListName are required" }, { status: 400 });
        }

        const taskList = await prisma.tasklists.create({
            data: {
                ProjectID,
                ListName
            }
        });

        return NextResponse.json(taskList, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create task list" }, { status: 500 });
    }
}
